"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare, ShoppingCart, BookOpen, Dumbbell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const quickActions = [
  { id: "task", label: "Add Task", icon: CheckSquare, href: "/tasks?add=true" },
  { id: "grocery", label: "Add Grocery", icon: ShoppingCart, href: "/groceries?add=true" },
  { id: "journal", label: "Journal Entry", icon: BookOpen, href: "/journal?add=true" },
  { id: "workout", label: "Log Workout", icon: Dumbbell, href: "/fitness?add=true" },
];

export function FAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center md:hidden"
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
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Quick Add</SheetTitle>
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
                    className="w-full h-auto py-6 flex flex-col gap-2 rounded-2xl"
                    onClick={() => {
                      setOpen(false);
                      window.location.href = action.href;
                    }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{action.label}</span>
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
