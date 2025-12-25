"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Home, Vote, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vote", label: "Vote", icon: Vote },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 shadow-2xl">
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={clsx(
                  "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="relative z-10 w-4 h-4" />
                <span className="relative z-10 text-sm font-medium hidden sm:inline">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

