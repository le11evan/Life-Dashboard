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
  { href: "/goals", label: "Goals", icon: Target, color: "text-[#FF2D78]" },
  { href: "/learn", label: "Learn", icon: GraduationCap, color: "text-[#00E5FF]" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "text-[#9D4EDD]" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-[#8888a0]" },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title = "elevan.life" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/[0.06] md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2.5">
          <Mark47 size={28} gradient />
          <h1 className="text-lg font-semibold">
            <span className="text-white">elevan</span>
            <span className="text-[#FF2D78]">.life</span>
          </h1>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#8888a0] hover:text-white hover:bg-white/[0.05]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0 bg-[#12121e] border-white/[0.08]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <span className="font-semibold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8888a0] hover:text-white hover:bg-white/[0.05]"
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
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#8888a0] hover:bg-white/[0.03] hover:text-white transition-colors"
                        >
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>

              <div className="p-4 border-t border-white/[0.06]">
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
