"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { ArrowRight, Shield, Lock, BarChart3 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useEncryptedSurvey } from "@/hooks/useEncryptedSurvey";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  const { surveyTitle, surveyDescription, isActive, surveyStats, isOnSupportedChain } = useEncryptedSurvey();

  return (
    <div className="page-transition">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Logo />
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
          >
            {surveyTitle || "Privacy-Preserving Voting System"}
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-8"
          >
            {surveyDescription || "Vote securely with fully homomorphic encryption. Your choices remain private until aggregated results are revealed."}
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-12">
            <ConnectButton accountStatus="address" showBalance={false} chainStatus="icon" />
          </motion.div>

          {isActive && (
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-6"
            >
              <Link href="/vote">
                <motion.button
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    Start Voting
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl -z-10"
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
              <Link href="/results">
                <motion.button
                  className="px-8 py-4 glass-panel rounded-full text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Results
                </motion.button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: Shield,
              title: "Fully Encrypted",
              description: "Your votes are encrypted using FHE technology, ensuring complete privacy throughout the voting process.",
              color: "from-indigo-500 to-blue-600",
            },
            {
              icon: Lock,
              title: "Zero-Knowledge",
              description: "No one can see your individual vote. Only aggregated results are revealed after decryption.",
              color: "from-purple-500 to-pink-600",
            },
            {
              icon: BarChart3,
              title: "Transparent Results",
              description: "View real-time encrypted tallies and decrypt final results when authorized.",
              color: "from-emerald-500 to-teal-600",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-3xl group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        {surveyStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-3xl p-8 mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Live Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                  {Number(surveyStats.participantCount)}
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {Number(surveyStats.totalOptions)}
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Options</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                  {isActive ? "✓" : "—"}
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Status</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
                  {isOnSupportedChain ? "✓" : "—"}
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Network</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Connect Wallet", desc: "Link your Web3 wallet to participate" },
              { step: "2", title: "Cast Your Vote", desc: "Select your choice (encrypted locally)" },
              { step: "3", title: "Homomorphic Aggregation", desc: "Votes are aggregated without decryption" },
              { step: "4", title: "View Results", desc: "Decrypt and see the final tallies" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
