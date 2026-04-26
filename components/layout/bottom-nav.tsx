"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Apple,
  Wallet,
  BookOpen,
  ShoppingCart,
  Target,
  Lightbulb,
  Settings,
  MoreHorizontal,
  X,
} from "lucide-react";

const primaryNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/diet", label: "Diet", icon: Apple },
];

const moreNavItems = [
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/creative", label: "Creative", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreNavItems.some((item) => isItemActive(pathname, item.href));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: "rgba(7,7,15,0.82)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute left-4 right-4"
              style={{
                bottom: 92,
                background: "var(--ink-150)",
                border: "1px solid var(--line)",
                borderRadius: 22,
                padding: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="t-kicker">more</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--fg-mute)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreNavItems.map((item) => {
                  const isActive = isItemActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center gap-2 p-3"
                      style={{
                        borderRadius: 14,
                        background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                        color: isActive ? "var(--fg)" : "var(--fg-mute)",
                        border: "1px solid",
                        borderColor: isActive ? "var(--line)" : "transparent",
                      }}
                    >
                      <Icon className="w-6 h-6" />
                      <span
                        className="t-mono"
                        style={{
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="nav lg:hidden" aria-label="Primary">
        {primaryNavItems.map((item) => {
          const isActive = isItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav__item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              <span className="nav__dot" />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`nav__item ${isMoreActive || moreOpen ? "active" : ""}`}
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
          <span className="nav__dot" />
        </button>
      </nav>
    </>
  );
}
