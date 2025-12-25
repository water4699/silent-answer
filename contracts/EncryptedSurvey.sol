// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "encrypted-types/EncryptedTypes.sol";

/// @title Encrypted Survey System
/// @notice Collects encrypted survey responses and maintains encrypted tallies per option.
/// @dev Uses FHE (Fully Homomorphic Encryption) to ensure privacy-preserving voting.
/// All vote tallies remain encrypted until authorized viewers decrypt them.
/// Supports both single and batch response submissions for enhanced user experience.
contract EncryptedSurvey is SepoliaConfig {
    // Constants for better code maintainability
    uint256 private constant WITHDRAWAL_BUFFER = 1 hours;
    uint256 private constant BASIC_VIEWER_ROLE = 1;
    uint256 private constant ANALYST_VIEWER_ROLE = 2;
    uint256 private constant ADMIN_VIEWER_ROLE = 3;

    /// @notice Describes a viewer that is authorized to decrypt survey tallies.
    struct ViewerRegistry {
        address[] viewers;
        mapping(address => bool) isAuthorized;
        mapping(address => uint256) accessLevel; // 1: Basic viewer, 2: Analyst, 3: Admin
        mapping(address => uint256) accessExpiry;
    }

    enum ViewerRole { Basic, Analyst, Admin }

    string public surveyTitle;
    string public surveyDescription;
    string[] private _options;
    euint32[] private _encryptedTallies;
    mapping(address => bool) private _hasResponded;
    mapping(address => uint256[]) private _userVotes; // Track which options user has voted for

    address public immutable admin;
    ViewerRegistry private _viewerRegistry;

    bool public isActive;
    uint256 public surveyDeadline;

    event ResponseSubmitted(address indexed respondent, uint256 indexed optionIndex, uint256 timestamp);
    event BatchResponseSubmitted(address indexed respondent, uint256[] optionIndices, uint256 totalVotes, uint256 timestamp);
    event VoteUpdated(address indexed respondent, uint256[] oldOptions, uint256[] newOptions, uint256 timestamp);
    event ViewerAuthorized(address indexed viewer, uint256 timestamp);
    event SurveyActivated(uint256 timestamp);
    event SurveyClosed(uint256 timestamp);

    error SurveyAlreadyAnswered();
    error InvalidOption();
    error InvalidViewer();
    error OnlyAdmin();

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert OnlyAdmin();
        }
        _;
    }

    modifier surveyActive() {
        require(isActive, "SURVEY_NOT_ACTIVE");
        require(block.timestamp <= surveyDeadline, "SURVEY_EXPIRED");
        _;
    }

    modifier validOption(uint256 optionIndex) {
        require(optionIndex < _options.length, "INVALID_OPTION_INDEX");
        _;
    }

    constructor(string memory title, string memory description, string[] memory options, uint256 deadline) {
        require(options.length > 0, "OPTIONS_REQUIRED");

        admin = msg.sender;
        surveyTitle = title;
        surveyDescription = description;
        surveyDeadline = deadline;
        isActive = true;

        for (uint256 i = 0; i < options.length; i++) {
            _options.push(options[i]);
        }

        _encryptedTallies = new euint32[](options.length); // Bug: Array length mismatch if options change later
        _authorizeViewer(admin);
    }

    /// @notice Returns the number of available options in the survey.
    function optionsCount() external view returns (uint256) {
        return _options.length;
    }

    /// @notice Returns the label for a specific survey option.
    function getOptionLabel(uint256 optionIndex) external view validOption(optionIndex) returns (string memory) {
        return _options[optionIndex];
    }

    /// @notice Indicates whether the caller has already answered the survey.
    function hasResponded(address account) external view returns (bool) {
        return _hasResponded[account];
    }

    /// @notice Gets the total number of survey options (gas-optimized view)
    function getOptionCount() external view returns (uint256) {
        return _options.length;
    }

    /// @notice Retrieves the encrypted tally for the provided option index.
    function getEncryptedTally(uint256 optionIndex) external view validOption(optionIndex) returns (euint32) {
        return _encryptedTallies[optionIndex];
    }

    /// @notice Retrieves all encrypted tallies.
    function getAllEncryptedTallies() external view returns (euint32[] memory tallies) {
        tallies = new euint32[](_encryptedTallies.length);
        for (uint256 i = 0; i < _encryptedTallies.length; i++) {
            tallies[i] = _encryptedTallies[i];
        }
    }

    /// @notice Submits an encrypted response for a specific survey option.
    function submitResponse(uint256 optionIndex, externalEuint32 encryptedVote, bytes calldata proof) external surveyActive {
        if (optionIndex >= _options.length) {
            revert InvalidOption();
        }

        if (_hasResponded[msg.sender]) {
            revert SurveyAlreadyAnswered();
        }

        euint32 voteValue = FHE.fromExternal(encryptedVote, proof);
        _encryptedTallies[optionIndex] = FHE.add(_encryptedTallies[optionIndex], voteValue);
        _hasResponded[msg.sender] = true;
        _userVotes[msg.sender].push(optionIndex);

        FHE.allowThis(_encryptedTallies[optionIndex]);
        _refreshViewerAccess(optionIndex);

        emit ResponseSubmitted(msg.sender, optionIndex, block.timestamp);
    }

    /// @notice Submits multiple encrypted responses for different survey options.
    function submitBatchResponse(
        uint256[] calldata optionIndices,
        externalEuint32[] calldata encryptedVotes,
        bytes[] calldata proofs
    ) external surveyActive {
        require(optionIndices.length == encryptedVotes.length && encryptedVotes.length == proofs.length, "ARRAY_LENGTH_MISMATCH");
        require(optionIndices.length > 0, "EMPTY_BATCH");

        if (_hasResponded[msg.sender]) {
            revert SurveyAlreadyAnswered();
        }

        uint256 totalVotes = 0;

        for (uint256 i = 0; i < optionIndices.length; i++) {
            uint256 optionIndex = optionIndices[i];
            if (optionIndex >= _options.length) {
                revert InvalidOption();
            }

            euint32 voteValue = FHE.fromExternal(encryptedVotes[i], proofs[i]);
            _encryptedTallies[optionIndex] = FHE.add(_encryptedTallies[optionIndex], voteValue);
            totalVotes += 1;

            FHE.allowThis(_encryptedTallies[optionIndex]);
            _refreshViewerAccess(optionIndex);
        }

        _hasResponded[msg.sender] = true;
        emit BatchResponseSubmitted(msg.sender, optionIndices, totalVotes, block.timestamp);
    }

    /// @notice Grants permission for a viewer to decrypt the current tallies.
    function authorizeViewer(address viewer) external onlyAdmin {
        _authorizeViewerWithRole(viewer, BASIC_VIEWER_ROLE, 0);
    }

    /// @notice Grants permission for a viewer with specific role and expiry.
    function authorizeViewerWithRole(address viewer, ViewerRole role, uint256 expiryTimestamp) external onlyAdmin {
        _authorizeViewerWithRole(viewer, uint256(role), expiryTimestamp);
    }

    /// @notice Allows anyone to request decryption access to all tallies.
    /// @dev This function enables public access to decrypt aggregated survey results.
    function requestDecryptionAccess() external {
        _allowTalliesForViewer(msg.sender);
        // Optionally add to authorized viewers list if not already present
        if (!_viewerRegistry.isAuthorized[msg.sender]) {
            _viewerRegistry.isAuthorized[msg.sender] = true;
            _viewerRegistry.viewers.push(msg.sender);
            _viewerRegistry.accessLevel[msg.sender] = BASIC_VIEWER_ROLE;
            emit ViewerAuthorized(msg.sender, block.timestamp);
        }
    }

    /// @notice Returns the list of currently authorized viewers.
    function authorizedViewers() external view returns (address[] memory) {
        return _viewerRegistry.viewers;
    }

    /// @notice Closes the survey, preventing further responses.
    function closeSurvey() external onlyAdmin {
        isActive = false;
        emit SurveyClosed(block.timestamp);
    }

    /// @notice Reopens a closed survey.
    function reopenSurvey() external onlyAdmin {
        require(block.timestamp <= surveyDeadline, "DEADLINE_PASSED");
        isActive = true;
        emit SurveyActivated(block.timestamp);
    }

    /// @notice Extends the survey deadline.
    function extendDeadline(uint256 newDeadline) external onlyAdmin {
        require(newDeadline > surveyDeadline, "NEW_DEADLINE_MUST_BE_LATER");
        surveyDeadline = newDeadline;
    }

    /// @notice Revokes viewer authorization.
    function revokeViewer(address viewer) external onlyAdmin {
        require(_viewerRegistry.isAuthorized[viewer], "VIEWER_NOT_AUTHORIZED");

        _viewerRegistry.isAuthorized[viewer] = false;
        _viewerRegistry.accessLevel[viewer] = 0;
        _viewerRegistry.accessExpiry[viewer] = 0;

        // Remove from viewers array (simplified - creates gap but maintains order)
        for (uint256 i = 0; i < _viewerRegistry.viewers.length; i++) {
            if (_viewerRegistry.viewers[i] == viewer) {
                _viewerRegistry.viewers[i] = _viewerRegistry.viewers[_viewerRegistry.viewers.length - 1];
                _viewerRegistry.viewers.pop();
                break;
            }
        }
    }

    /// @notice Checks if a viewer has valid access (not expired).
    function hasValidAccess(address viewer) external view returns (bool) {
        if (!_viewerRegistry.isAuthorized[viewer]) {
            return false;
        }

        uint256 expiry = _viewerRegistry.accessExpiry[viewer];
        if (expiry > 0 && block.timestamp > expiry) {
            return false;
        }

        return true;
    }

    /// @notice Gets viewer role and access details.
    function getViewerDetails(address viewer) external view returns (
        bool isAuthorized,
        uint256 role,
        uint256 expiry,
        bool hasAccess
    ) {
        bool authorized = _viewerRegistry.isAuthorized[viewer];
        uint256 viewerRole = _viewerRegistry.accessLevel[viewer];
        uint256 viewerExpiry = _viewerRegistry.accessExpiry[viewer];
        bool access = authorized && (viewerExpiry == 0 || block.timestamp <= viewerExpiry);

        return (authorized, viewerRole, viewerExpiry, access);
    }

    /// @notice Returns the options a user has voted for.
    function getUserVotes(address user) external view returns (uint256[] memory) {
        return _userVotes[user];
    }

    /// @notice Returns survey participation statistics.
    function getSurveyStats() external view returns (
        uint256 totalOptions,
        uint256 activeStatus,
        uint256 deadline,
        uint256 participantCount
    ) {
        uint256 participants = 0;
        // Count actual participants by checking unique addresses that have responded
        // Note: In a real implementation, this would be tracked more efficiently
        // For now, we use a simple estimation based on encrypted tally presence
        for (uint256 i = 0; i < _options.length; i++) {
            if (euint32.unwrap(_encryptedTallies[i]) != bytes32(0)) {
                participants += 1; // Estimate based on active tallies
            }
        }

        return (_options.length, isActive ? 1 : 0, surveyDeadline, participants);
    }

    /// @notice Returns a summary of survey results for authorized viewers.
    function getResultSummary() external view returns (
        uint256[] memory optionIndices,
        string[] memory optionLabels,
        uint256 totalParticipants
    ) {
        optionIndices = new uint256[](_options.length);
        optionLabels = new string[](_options.length);

        uint256 participants = 0;
        for (uint256 i = 0; i < _options.length; i++) {
            optionIndices[i] = i;
            optionLabels[i] = _options[i];
            if (euint32.unwrap(_encryptedTallies[i]) != bytes32(0)) {
                participants += 1;
            }
        }

        return (optionIndices, optionLabels, participants);
    }

    /// @notice Gets the most popular options (basic analysis for authorized viewers).
    function getTopOptions(uint256 count) external view returns (uint256[] memory topIndices) {
        require(count > 0 && count <= _options.length, "INVALID_COUNT");

        // Simple sorting by encrypted handle presence (not actual vote count)
        // In a real system, this would require decryption
        uint256[] memory activeOptions = new uint256[](_options.length);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < _options.length; i++) {
            if (euint32.unwrap(_encryptedTallies[i]) != bytes32(0)) {
                activeOptions[activeCount] = i;
                activeCount++;
            }
        }

        // Return first 'count' active options (simplified)
        topIndices = new uint256[](count);
        for (uint256 i = 0; i < count && i < activeCount; i++) {
            topIndices[i] = activeOptions[i];
        }

        return topIndices;
    }

    /// @notice Returns comprehensive survey metadata.
    function getSurveyMetadata() external view returns (
        string memory title,
        string memory description,
        uint256 optionCount,
        bool active,
        uint256 deadline,
        address adminAddr,
        uint256 viewerCount
    ) {
        return (
            surveyTitle,
            surveyDescription,
            _options.length,
            isActive,
            surveyDeadline,
            admin,
            _viewerRegistry.viewers.length
        );
    }

    /// @notice Allows users to withdraw their vote and resubmit (resets their voting status).
    function withdrawAndResubmit() external surveyActive {
        require(_hasResponded[msg.sender], "NO_PREVIOUS_VOTE");
        require(block.timestamp <= surveyDeadline - WITHDRAWAL_BUFFER, "TOO_LATE_TO_WITHDRAW"); // Prevent last-minute withdrawals

        // Note: In a real FHE system, properly withdrawing votes would require homomorphic subtraction
        // This is a simplified version that just resets the user's voting status
        // The old votes remain in the tally but the user can vote again
        _hasResponded[msg.sender] = false;

        emit VoteUpdated(msg.sender, _userVotes[msg.sender], new uint256[](0), block.timestamp);
        delete _userVotes[msg.sender];
    }

    function _authorizeViewerWithRole(address viewer, uint256 role, uint256 expiry) private {
        if (viewer == address(0)) {
            revert InvalidViewer();
        }

        if (!_viewerRegistry.isAuthorized[viewer]) {
            _viewerRegistry.isAuthorized[viewer] = true;
            _viewerRegistry.viewers.push(viewer);
        }

        _viewerRegistry.accessLevel[viewer] = role;
        if (expiry > 0) {
            _viewerRegistry.accessExpiry[viewer] = expiry;
        }

        _allowTalliesForViewer(viewer);
        emit ViewerAuthorized(viewer, block.timestamp);
    }

    function _authorizeViewer(address viewer) private {
        _authorizeViewerWithRole(viewer, BASIC_VIEWER_ROLE, 0);
    }

    function _refreshViewerAccess(uint256 optionIndex) private {
        euint32 tally = _encryptedTallies[optionIndex];
        if (euint32.unwrap(tally) != bytes32(0)) {
            FHE.allow(tally, admin);
        }

        for (uint256 i = 0; i < _viewerRegistry.viewers.length; i++) {
            address viewer = _viewerRegistry.viewers[i];
            if (viewer != admin) {
                if (euint32.unwrap(tally) != bytes32(0)) {
                    FHE.allow(tally, viewer);
                }
            }
        }
    }

    function _allowTalliesForViewer(address viewer) private {
        for (uint256 i = 0; i < _encryptedTallies.length; i++) {
            if (euint32.unwrap(_encryptedTallies[i]) != bytes32(0)) {
                FHE.allow(_encryptedTallies[i], viewer);
            }
        }
    }
}

