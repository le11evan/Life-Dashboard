"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare, ShoppingCart, BookOpen, Dumbbell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const quickActions = [
  { id: "task", label: "Add Task", icon: CheckSquare, href: "/tasks?add=true", accent: "cyan" },
  { id: "grocery", label: "Add Grocery", icon: ShoppingCart, href: "/groceries?add=true", accent: "lime" },
  { id: "journal", label: "Journal Entry", icon: BookOpen, href: "/journal?add=true", accent: "yellow" },
  { id: "workout", label: "Log Workout", icon: Dumbbell, href: "/fitness?add=true", accent: "orange" },
];

export function FAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Quick add"
        onClick={() => setOpen(true)}
        className="fab lg:hidden"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t"
          style={{
            background: "var(--ink-100)",
            borderColor: "var(--line)",
          }}
        >
          <SheetHeader className="pb-4">
            <SheetTitle style={{ color: "var(--fg)", fontFamily: "var(--ff-display)", letterSpacing: "-0.02em" }}>
              Quick add
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 pb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  type="button"
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`tile tile--elev edge-${action.accent} flex flex-col items-center justify-center gap-2`}
                  style={{ padding: "22px 16px", cursor: "pointer" }}
                  onClick={() => {
                    setOpen(false);
                    window.location.href = action.href;
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: `var(--${action.accent})` }}
                  />
                  <span
                    className="t-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--fg)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
