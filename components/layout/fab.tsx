"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare, ShoppingCart, BookOpen, Dumbbell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const quickActions = [
  { id: "task", label: "Add Task", icon: CheckSquare, href: "/tasks?add=true", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
  { id: "grocery", label: "Add Grocery", icon: ShoppingCart, href: "/groceries?add=true", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20" },
  { id: "journal", label: "Journal Entry", icon: BookOpen, href: "/journal?add=true", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
  { id: "workout", label: "Log Workout", icon: Dumbbell, href: "/fitness?add=true", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20" },
];

export function FAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center md:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Quick Add Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Quick Add</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 pb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full h-auto py-6 flex flex-col gap-2 rounded-2xl border ${action.bg} transition-all`}
                    onClick={() => {
                      setOpen(false);
                      window.location.href = action.href;
                    }}
                  >
                    <Icon className={`w-6 h-6 ${action.color}`} />
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
