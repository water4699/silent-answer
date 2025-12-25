# Encrypted Survey System

An end-to-end encrypted survey platform that captures privacy-preserving responses, aggregates results homomorphically on-chain, and decrypts insights only for authorized viewers. Built with Zama FHEVM, Hardhat, and Next.js.

## 🌐 Live Demo

- **Deployed Application**: https://questionnaire-axxpp.vercel.app/
- **Demo Video**: https://github.com/RexHansen6/silent-answers/blob/main/questionnaire.mp4
- **Testnet Contract**: `0xd838319c0A79721Cc801220d57b1d9BbC557b59a` (Sepolia)

## ✨ Key Features

- **🔒 Private Submissions** – Survey answers are encrypted in the browser using FHE and never appear in plaintext on-chain
- **🔬 Homomorphic Analytics** – Tallies for each survey option are computed directly over ciphertext inside the smart contract
- **👥 Controlled Access** – Only administrators and explicitly authorized wallets can decrypt the final aggregated results
- **🎨 Modern UX** – RainbowKit wallet connection with custom branding, responsive design, and accessibility features
- **⚡ Real-time Updates** – Live survey status, participant statistics, and encrypted result visualization
- **🔧 Admin Panel** – Survey management tools including deadline extension, viewer authorization, and survey controls

## 📦 Project Structure

```
encrypted-survey-system/
├── contracts/               # EncryptedSurvey.sol smart contract with FHE
├── deploy/                  # Hardhat deployment scripts
├── tasks/                   # Custom Hardhat CLI helpers
├── test/                    # Contract unit tests
├── frontend/                # Next.js application with RainbowKit
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── fhevm/               # FHEVM integration utilities
│   └── abi/                 # Contract ABIs and addresses
├── deployments/             # Deployment artifacts per network
├── types/                   # TypeScript type definitions
├── artifacts/               # Compiled contract artifacts
├── cache/                   # Hardhat compilation cache
└── README.md
```

## 🛠 Prerequisites

- **Node.js 20+**
- **npm 9+** (or a compatible package manager)
- WalletConnect **Project ID** for RainbowKit (`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`)
- Access to a Hardhat node or the Zama FHEVM DevNet

## 🚀 Getting Started

### 1. Backend setup

```bash
cd encrypted-survey-system
npm install
```

Set up the required Hardhat secrets:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY   # optional for verification
```

Compile, test, and deploy locally:

```bash
npm run compile
npm run test
npx hardhat node                                   # run in a separate terminal
npx hardhat deploy --network localhost
```

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Generate ABI/addresses for the UI and start the dev server:

```bash
npm run genabi
npm run dev
```

Visit **http://localhost:3000** to use the encrypted survey dashboard.

## 🧠 Smart Contract Features

`contracts/EncryptedSurvey.sol` implements a comprehensive encrypted survey system:

### Core Functionality
- **Survey Management**: Create surveys with title, description, options, and deadline
- **Encrypted Submissions**: Accept FHE-encrypted responses with proof verification
- **Batch Voting**: Support multiple option selection in single transaction
- **Access Control**: Role-based viewer authorization (Basic, Analyst, Admin)

### Security Features
- **Input Validation**: Array bounds checking and deadline validation
- **Time-based Restrictions**: Prevent last-minute vote withdrawals
- **Admin Controls**: Survey lifecycle management (close, reopen, extend deadline)
- **Viewer Management**: Granular access control with expiry dates

### Advanced Features
- **Homomorphic Operations**: On-chain tally aggregation over encrypted data
- **Event Logging**: Comprehensive event emission with timestamps
- **Gas Optimization**: Efficient view functions for frontend integration
- **Error Handling**: Custom error messages for better debugging

### Hardhat tasks

| Task name             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `survey:address`      | Prints the contract address for the current network      |
| `survey:submit`       | Submits an encrypted vote for the chosen option          |
| `survey:decrypt`      | Decrypts a tally for an authorized viewer                |
| `survey:authorize`    | Authorizes a viewer address (admin only)                 |

Run tasks with e.g. `npx hardhat --network localhost survey:submit --option 1`.

## 🧪 Testing

The `test/EncryptedSurvey.ts` suite runs against the FHEVM mock environment:

```bash
npx hardhat test
```

Tests cover initialization, encrypted submissions, and the authorized viewer flow.

## 🎨 Frontend Features

The Next.js application provides a modern, accessible survey interface:

### User Experience
- **Wallet Integration**: RainbowKit-powered connection with custom theming
- **Responsive Design**: Mobile-first approach with glass morphism effects
- **Accessibility**: Keyboard navigation, screen reader support, and ARIA labels
- **Real-time Feedback**: Loading states, error messages, and success confirmations

### Survey Interface
- **Encrypted Voting**: Client-side FHE encryption before submission
- **Batch Selection**: Multi-option voting with visual feedback
- **Progress Tracking**: Live survey statistics and participant counts
- **Result Visualization**: Decrypted tally display with interactive charts

### Admin Panel
- **Survey Management**: Close/reopen surveys, extend deadlines
- **Viewer Authorization**: Grant access with role-based permissions
- **Advanced Controls**: Collapsible admin options for clean UI
- **Vote Management**: Allow users to withdraw and resubmit votes

### Technical Implementation
- **Custom Hooks**: `useEncryptedSurvey` for blockchain interaction
- **State Management**: React state with optimistic updates
- **Performance**: Memoized components and efficient re-renders
- **Type Safety**: Full TypeScript coverage with generated contract types

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Compile contracts
npm run compile

# Start local Hardhat node
npx hardhat node

# Deploy locally
npx hardhat deploy --network localhost

# Start frontend
cd frontend
npm install
npm run genabi
npm run dev
```

### Testnet Deployment
```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm run export
# Deploy dist/ folder to Vercel, Netlify, or your preferred hosting
```

## 🧪 Testing

```bash
# Run contract tests
npm run test

# Run with coverage
npm run coverage

# Test on Sepolia
npm run test:sepolia
```

## 📚 Documentation & Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Plugin Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for privacy-preserving survey systems using Fully Homomorphic Encryption**

🔗 **Live Demo**: https://questionnaire-axxpp.vercel.app/
🎥 **Demo Video**: https://github.com/RexHansen6/silent-answers/blob/main/questionnaire.mp4
📄 **Contract**: `0xd838319c0A79721Cc801220d57b1d9BbC557b59a` (Sepolia)
