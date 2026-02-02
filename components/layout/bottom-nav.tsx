"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Wallet,
  Apple,
  BookOpen,
  ShoppingCart,
  Target,
  Lightbulb,
  Settings,
  MoreHorizontal,
  X,
} from "lucide-react";

const primaryNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard, color: "violet" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "blue" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, color: "red" },
  { href: "/diet", label: "Diet", icon: Apple, color: "lime" },
];

const moreNavItems = [
  { href: "/finance", label: "Finance", icon: Wallet, color: "emerald" },
  { href: "/journal", label: "Journal", icon: BookOpen, color: "amber" },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart, color: "green" },
  { href: "/goals", label: "Goals", icon: Target, color: "purple" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "pink" },
  { href: "/settings", label: "Settings", icon: Settings, color: "slate" },
];

const colorClasses: Record<string, { text: string; bg: string }> = {
  violet: { text: "text-violet-400", bg: "bg-violet-400" },
  blue: { text: "text-blue-400", bg: "bg-blue-400" },
  red: { text: "text-red-400", bg: "bg-red-400" },
  lime: { text: "text-lime-400", bg: "bg-lime-400" },
  slate: { text: "text-slate-400", bg: "bg-slate-400" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-400" },
  amber: { text: "text-amber-400", bg: "bg-amber-400" },
  green: { text: "text-green-400", bg: "bg-green-400" },
  purple: { text: "text-purple-400", bg: "bg-purple-400" },
  pink: { text: "text-pink-400", bg: "bg-pink-400" },
};

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Check if current page is in the "more" section
  const isMoreActive = moreNavItems.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-20 left-4 right-4 bg-slate-900 rounded-2xl border border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">More</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const colors = colorClasses[item.color];

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                        isActive
                          ? `bg-${item.color}-500/20 ${colors.text}`
                          : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const colors = colorClasses[item.color];

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? colors.text : "text-slate-500"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${colors.bg}`}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="relative flex flex-col items-center justify-center flex-1 h-full"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 ${
                isMoreActive || moreOpen ? "text-white" : "text-slate-500"
              }`}
            >
              <div className="relative">
                <MoreHorizontal className="w-5 h-5" />
                {isMoreActive && !moreOpen && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </div>
              <span className="text-[10px] font-medium">More</span>
            </motion.div>
          </button>
        </div>
      </nav>
    </>
  );
}
