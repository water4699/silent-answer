"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEncryptedSurvey } from "@/hooks/useEncryptedSurvey";

export default function VotePage() {
  const {
    surveyTitle,
    surveyDescription,
    options,
    hasResponded,
    isOnSupportedChain,
    message,
    isSubmitting,
    isBatchSubmitting,
    isActive,
    submitResponse,
    submitBatchResponse,
    userVotes,
    withdrawAndResubmit,
  } = useEncryptedSurvey();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);

  const cardOptions = useMemo(
    () =>
      options.length > 0
        ? options
        : ["Option A", "Option B", "Option C", "Option D"],
    [options],
  );

  const canSubmit =
    ((selectedOption !== null && !isBatchMode) || (selectedOptions.size > 0 && isBatchMode)) &&
    !isSubmitting &&
    !isBatchSubmitting &&
    !hasResponded &&
    isOnSupportedChain &&
    Boolean(contractAddress) &&
    isActive;

  const handleSubmit = async () => {
    if (isBatchMode) {
      await submitBatchResponse(Array.from(selectedOptions));
    } else if (selectedOption !== null) {
      await submitResponse(selectedOption);
    }
  };

  return (
    <div className="page-transition">
      <div className="mx-auto w-full max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl px-8 py-10 mb-8"
        >
          <div className="flex flex-col gap-4 mb-6">
            <h1 className="text-4xl font-bold text-white">{surveyTitle || "Cast Your Vote"}</h1>
            <p className="text-lg text-slate-300">{surveyDescription || "Select your choice below. Your vote will be encrypted and remain private."}</p>
          </div>

          {!isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-2xl text-amber-200"
            >
              ⚠️ Survey is currently closed.
            </motion.div>
          )}

          {hasResponded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl"
            >
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Your vote has been recorded!</span>
              </div>
              {userVotes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {userVotes.map((voteIndex, idx) => {
                    const optionIndex = Number(voteIndex);
                    const optionLabel = cardOptions[optionIndex] || `Option ${optionIndex}`;
                    return (
                      <span key={idx} className="rounded-full bg-emerald-500/30 px-3 py-1 text-sm text-emerald-200">
                        {optionLabel}
                      </span>
                    );
                  })}
                </div>
              )}
              {isActive && (
                <button
                  onClick={() => withdrawAndResubmit()}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-full text-sm font-semibold text-amber-950 transition-colors"
                >
                  Withdraw & Resubmit
                </button>
              )}
            </motion.div>
          )}

          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isBatchMode}
                onChange={(e) => {
                  setIsBatchMode(e.target.checked);
                  if (e.target.checked) {
                    setSelectedOption(null);
                  } else {
                    setSelectedOptions(new Set());
                  }
                }}
                className="h-4 w-4 rounded border-slate-400 text-indigo-400 focus:ring-indigo-400"
                disabled={hasResponded}
              />
              Enable batch mode (select multiple options)
            </label>
          </div>
        </motion.div>

        <div className="space-y-4 mb-8">
          <AnimatePresence mode="wait">
            {cardOptions.map((optionLabel, index) => {
              const isSelected = isBatchMode ? selectedOptions.has(index) : selectedOption === index;
              const disabled = hasResponded;

              return (
                <motion.label
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={clsx(
                    "flex cursor-pointer items-center justify-between rounded-2xl border px-6 py-5 transition-all duration-300",
                    "border-white/5 bg-white/3 hover:bg-white/10 focus-within:outline focus-within:outline-2 focus-within:outline-slate-300/50",
                    isSelected && "border-indigo-400/80 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 shadow-lg shadow-indigo-500/20",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected ? "border-indigo-400 bg-indigo-500" : "border-slate-400"
                    )}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <span className="text-lg font-medium text-white">{optionLabel}</span>
                  </div>
                  <input
                    type={isBatchMode ? "checkbox" : "radio"}
                    name={isBatchMode ? `survey-option-${index}` : "survey-option"}
                    value={index}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => {
                      if (isBatchMode) {
                        const newSelected = new Set(selectedOptions);
                        if (newSelected.has(index)) {
                          newSelected.delete(index);
                        } else {
                          newSelected.add(index);
                        }
                        setSelectedOptions(newSelected);
                      } else {
                        setSelectedOption(selectedOption === index ? null : index);
                      }
                    }}
                    className="sr-only"
                  />
                </motion.label>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={clsx(
              "relative px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300",
              canSubmit
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg hover:shadow-2xl"
                : "cursor-not-allowed bg-white/10 text-slate-400"
            )}
            whileHover={canSubmit ? { scale: 1.05 } : {}}
            whileTap={canSubmit ? { scale: 0.95 } : {}}
          >
            {isSubmitting || isBatchSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Encrypting & Submitting…
              </span>
            ) : hasResponded ? (
              "Vote Recorded ✓"
            ) : isBatchMode ? (
              `Submit ${selectedOptions.size} encrypted votes`
            ) : (
              "Submit Encrypted Vote"
            )}
            {canSubmit && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 blur-xl -z-10"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

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
        </motion.div>
      </div>
    </div>
  );
}

