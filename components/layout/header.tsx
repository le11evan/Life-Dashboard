"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mark47 } from "@/components/ui/mark-47";
import {
  Menu,
  X,
  Target,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/goals", label: "Goals", icon: Target, color: "var(--pink)" },
  { href: "/learn", label: "Learn", icon: GraduationCap, color: "var(--cyan)" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "var(--purple)" },
  { href: "/settings", label: "Settings", icon: Settings, color: "var(--fg-mute)" },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title = "elevan.life" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 md:hidden"
      style={{
        background: "rgba(7,7,15,0.72)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2.5">
          <Mark47 size={24} gradient />
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontSize: 18,
            }}
          >
            <span style={{ color: "var(--fg)" }}>elevan</span>
            <span className="brand-gradient-text">.life</span>
          </h1>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              style={{ color: "var(--fg-dim)" }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 p-0"
            style={{
              background: "var(--ink-100)",
              borderLeft: "1px solid var(--line)",
            }}
          >
            <div className="flex flex-col h-full">
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: "1px solid var(--line-soft)" }}
              >
                <span
                  className="t-kicker"
                  style={{ fontSize: 11 }}
                >
                  menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpen(false)}
                  style={{ color: "var(--fg-mute)" }}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                <AnimatePresence>
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 row-press"
                          style={{
                            borderRadius: 14,
                            color: "var(--fg-dim)",
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                          <span style={{ fontWeight: 600 }}>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>

              <div
                className="p-4"
                style={{ borderTop: "1px solid var(--line-soft)" }}
              >
                <button
                  onClick={() => {
                    fetch("/api/logout", { method: "POST" }).then(() => {
                      window.location.href = "/login";
                    });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 row-press"
                  style={{
                    borderRadius: 14,
                    color: "var(--pink)",
                    background: "rgba(255,45,120,0.06)",
                    border: "1px solid rgba(255,45,120,0.18)",
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span style={{ fontWeight: 600 }}>Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
