"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  { href: "/goals", label: "Goals", icon: Target, color: "text-purple-400" },
  { href: "/learn", label: "Learn", icon: GraduationCap, color: "text-indigo-400" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "text-pink-400" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-slate-400" },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Life Dashboard" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-sm text-white font-bold">L</span>
          </div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0 bg-slate-900 border-white/10">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="font-semibold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  onClick={() => setOpen(false)}
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
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                        >
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => {
                    fetch("/api/logout", { method: "POST" }).then(() => {
                      window.location.href = "/login";
                    });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
