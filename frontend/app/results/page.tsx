"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Lock, Unlock } from "lucide-react";
import { useEncryptedSurvey } from "@/hooks/useEncryptedSurvey";

function truncate(value: string) {
  if (!value || value === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "0x0";
  }
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function ResultsPage() {
  const {
    surveyTitle,
    options,
    encryptedTallies,
    decryptedTallies,
    isOnSupportedChain,
    message,
    isDecrypting,
    decryptTallies,
    surveyStats,
  } = useEncryptedSurvey();

  const [isDecryptingState, setIsDecryptingState] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const cardOptions = options.length > 0
    ? options
    : ["Option A", "Option B", "Option C", "Option D"];

  const handleDecrypt = async () => {
    setIsDecryptingState(true);
    await decryptTallies();
    setIsDecryptingState(false);
  };

  // Find winner when decrypted tallies change
  useEffect(() => {
    if (decryptedTallies.length > 0) {
      const validVotes = decryptedTallies.filter((v): v is number => typeof v === "number" && v > 0);
      if (validVotes.length > 0) {
        const maxVotes = Math.max(...validVotes);
        const winnerIdx = decryptedTallies.findIndex((v) => v === maxVotes && typeof v === "number");
        if (winnerIdx !== -1 && maxVotes > 0) {
          setWinnerIndex(winnerIdx);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    }
  }, [decryptedTallies]);

  const hasDecrypted = decryptedTallies.some((v) => typeof v === "number");
  const totalVotes = decryptedTallies.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);

  return (
    <div className="page-transition">
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl px-8 py-10 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{surveyTitle || "Survey Results"}</h1>
              <p className="text-slate-300">View encrypted tallies and decrypt final results</p>
            </div>
            <motion.button
              onClick={handleDecrypt}
              disabled={isDecrypting || isDecryptingState || !isOnSupportedChain}
              className={clsx(
                "relative px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2",
                !isDecrypting && !isDecryptingState && isOnSupportedChain
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg hover:shadow-2xl"
                  : "cursor-not-allowed bg-white/10 text-slate-400"
              )}
              whileHover={!isDecrypting && !isDecryptingState && isOnSupportedChain ? { scale: 1.05 } : {}}
              whileTap={!isDecrypting && !isDecryptingState && isOnSupportedChain ? { scale: 0.95 } : {}}
            >
              {isDecrypting || isDecryptingState ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Decrypting...
                </>
              ) : hasDecrypted ? (
                <>
                  <Unlock className="w-5 h-5" />
                  Re-decrypt Results
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Decrypt Results
                </>
              )}
            </motion.button>
          </div>

          {surveyStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                  {Number(surveyStats.participantCount)}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Participants</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                  {Number(surveyStats.totalOptions)}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Options</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                  {totalVotes}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Total Votes</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-1">
                  {hasDecrypted ? "✓" : "🔒"}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Status</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Results Table */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Vote Tallies</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-300">Option</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-300">Encrypted Handle</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-300">Decrypted Tally</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-300">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {cardOptions.map((optionLabel, index) => {
                    const encrypted = encryptedTallies[index] ?? "0x0";
                    const decrypted = decryptedTallies[index];
                    const votes = typeof decrypted === "number" ? decrypted : 0;
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                    const isWinner = winnerIndex === index && hasDecrypted;

                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={clsx(
                          "transition-all duration-300",
                          isWinner && "winner-glow bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
                        )}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            {isWinner && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="text-2xl"
                              >
                                🏆
                              </motion.div>
                            )}
                            <span className="text-lg font-medium text-white">{optionLabel}</span>
                            {isWinner && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded-full"
                              >
                                WINNER
                              </motion.span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-4 font-mono text-slate-300 text-sm">{truncate(encrypted)}</td>
                        <td className="px-8 py-4">
                          <AnimatePresence mode="wait">
                            {typeof decrypted === "number" ? (
                              <motion.div
                                key="decrypted"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={clsx(
                                  "text-2xl font-bold",
                                  isWinner ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400" : "text-white"
                                )}
                              >
                                {decrypted}
                              </motion.div>
                            ) : encrypted === "0x0" ? (
                              <span className="text-slate-500">0</span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Locked
                              </span>
                            )}
                          </AnimatePresence>
                        </td>
                        <td className="px-8 py-4">
                          {typeof decrypted === "number" ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className={clsx(
                                    "h-full rounded-full",
                                    isWinner ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-indigo-400 to-purple-400"
                                  )}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-300 w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && winnerIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50vw",
                    y: "-10vh",
                    rotate: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: "110vh",
                    rotate: Math.random() * 360,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute text-4xl"
                >
                  {["🎉", "🎊", "🏆", "⭐", "✨"][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "mt-6 px-5 py-3 rounded-2xl text-sm",
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

