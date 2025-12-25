"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { Settings, Users, Calendar, Lock, Unlock, X, CheckCircle2 } from "lucide-react";
import { useEncryptedSurvey } from "@/hooks/useEncryptedSurvey";

function truncate(value: string) {
  if (!value || value === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "0x0";
  }
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function AdminPage() {
  const { address } = useAccount();
  const {
    adminAddress,
    authorizedViewers,
    isActive,
    surveyDeadline,
    surveyStats,
    viewerDetails,
    message,
    isAuthorizing,
    closeSurvey,
    reopenSurvey,
    extendDeadline,
    authorizeViewer,
    revokeViewer,
    isOnSupportedChain,
  } = useEncryptedSurvey();

  const [viewerAddress, setViewerAddress] = useState<string>("");
  const [newDeadline, setNewDeadline] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const isAdmin = address && adminAddress ? address.toLowerCase() === adminAddress.toLowerCase() : false;

  if (!isAdmin) {
    return (
      <div className="page-transition">
        <div className="mx-auto w-full max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl px-8 py-10 text-center"
          >
            <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Admin Access Required</h1>
            <p className="text-slate-300 mb-6">
              You need to be the survey administrator to access this page.
            </p>
            <p className="text-sm text-slate-400">
              Admin address: {adminAddress ? truncate(adminAddress) : "Not available"}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl px-8 py-10 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>

          {surveyStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                  {Number(surveyStats.participantCount)}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Participants</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                  {Number(surveyStats.totalOptions)}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Options</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                  {isActive ? "Active" : "Closed"}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Status</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-1">
                  {authorizedViewers.length}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Viewers</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Survey Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl px-8 py-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Survey Management
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {isActive ? (
              <motion.button
                onClick={() => closeSurvey()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-full text-white font-semibold transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Lock className="w-5 h-5" />
                Close Survey
              </motion.button>
            ) : (
              <motion.button
                onClick={() => reopenSurvey()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white font-semibold transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Unlock className="w-5 h-5" />
                Reopen Survey
              </motion.button>
            )}

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(event) => setNewDeadline(event.target.value)}
                  className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newDeadline) {
                      const timestamp = Math.floor(new Date(newDeadline).getTime() / 1000);
                      extendDeadline(timestamp);
                      setNewDeadline("");
                    }
                  }}
                  disabled={!newDeadline}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/10 disabled:text-slate-400 rounded-full text-sm font-semibold transition-colors"
                >
                  Extend Deadline
                </button>
              </motion.div>
            )}

            {surveyDeadline > 0n && (
              <div className="text-sm text-slate-400">
                Current deadline: {new Date(Number(surveyDeadline) * 1000).toLocaleDateString('en-US')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Viewer Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-3xl px-8 py-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Authorize Viewers
          </h2>

          <div className="mb-6">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2 block">
              Add New Viewer
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={viewerAddress}
                onChange={(event) => setViewerAddress(event.target.value)}
                placeholder="0x..."
                className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
              />
              <button
                onClick={() => {
                  const trimmed = viewerAddress.trim();
                  if (trimmed) {
                    authorizeViewer(trimmed);
                    setViewerAddress("");
                  }
                }}
                disabled={isAuthorizing || viewerAddress.trim() === "" || !isOnSupportedChain}
                className={clsx(
                  "px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                  !isAuthorizing && viewerAddress.trim() && isOnSupportedChain
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "cursor-not-allowed bg-white/10 text-slate-400"
                )}
              >
                {isAuthorizing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full"
                    />
                    Authorizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Authorize
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">Authorized Viewers</h3>
            {authorizedViewers.length > 0 ? (
              authorizedViewers.map((viewer) => {
                const details = viewerDetails[viewer.toLowerCase()];
                const roleLabels = ["Basic", "Analyst", "Admin"];
                const isViewerAdmin = viewer.toLowerCase() === adminAddress?.toLowerCase();

                return (
                  <motion.div
                    key={viewer}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-slate-300">{truncate(viewer)}</span>
                      {details && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={clsx(
                            "rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                            details.role === 2n ? "bg-purple-400/20 text-purple-200" :
                            details.role === 1n ? "bg-blue-400/20 text-blue-200" :
                            "bg-emerald-400/20 text-emerald-200"
                          )}>
                            {roleLabels[Number(details.role)] || "Basic"}
                          </span>
                          {details.expiry > 0n && (
                            <span className="text-slate-400">
                              Expires: {new Date(Number(details.expiry) * 1000).toLocaleDateString('en-US')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isViewerAdmin ? (
                        <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                          Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => revokeViewer(viewer)}
                          className="rounded-full bg-red-500/20 hover:bg-red-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Revoke
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                No viewers authorized yet.
              </div>
            )}
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "px-5 py-3 rounded-2xl text-sm",
              message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")
                ? "border-red-400/50 bg-red-500/10 text-red-200"
                : message.toLowerCase().includes("success")
                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-slate-200"
            )}
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
}

