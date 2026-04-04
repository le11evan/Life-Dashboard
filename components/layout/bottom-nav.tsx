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
  { href: "/", label: "Home", icon: LayoutDashboard, activeColor: "text-[#FF2D78]", dotColor: "bg-[#FF2D78]" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, activeColor: "text-[#00E5FF]", dotColor: "bg-[#00E5FF]" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, activeColor: "text-[#FF6B35]", dotColor: "bg-[#FF6B35]" },
  { href: "/diet", label: "Diet", icon: Apple, activeColor: "text-[#39FF14]", dotColor: "bg-[#39FF14]" },
];

const moreNavItems = [
  { href: "/finance", label: "Finance", icon: Wallet, activeColor: "text-[#9D4EDD]", activeBg: "bg-[#9D4EDD]/15" },
  { href: "/journal", label: "Journal", icon: BookOpen, activeColor: "text-[#FFD600]", activeBg: "bg-[#FFD600]/15" },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart, activeColor: "text-teal-400", activeBg: "bg-teal-500/15" },
  { href: "/goals", label: "Goals", icon: Target, activeColor: "text-[#FF2D78]", activeBg: "bg-[#FF2D78]/15" },
  { href: "/creative", label: "Creative", icon: Lightbulb, activeColor: "text-[#9D4EDD]", activeBg: "bg-[#9D4EDD]/15" },
  { href: "/settings", label: "Settings", icon: Settings, activeColor: "text-[#8888a0]", activeBg: "bg-white/[0.05]" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

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
            className="fixed inset-0 z-40 bg-[#0a0a14]/80 backdrop-blur-sm md:hidden"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-20 left-4 right-4 bg-[#12121e] rounded-2xl border border-white/[0.08] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">More</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-1 text-[#8888a0] hover:text-white"
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

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                        isActive
                          ? `${item.activeBg} ${item.activeColor}`
                          : "text-[#8888a0] hover:bg-white/[0.03]"
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a14]/90 backdrop-blur-xl border-t border-white/[0.06] md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? item.activeColor : "text-[#8888a0]/60"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.dotColor}`}
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
                isMoreActive || moreOpen ? "text-white" : "text-[#8888a0]/60"
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
