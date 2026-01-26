"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  greeting: string;
  today: string;
  children: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function DashboardClient({
  greeting,
  today,
  children,
}: DashboardClientProps) {
  const [todayMode, setTodayMode] = useState(false);

  // Convert children to array and filter based on today mode
  const childArray = Array.isArray(children) ? children : [children];

  // In Today Mode, only show first 3 widgets (Tasks, Groceries, Quote)
  const visibleChildren = todayMode ? childArray.slice(0, 3) : childArray;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{greeting}, Evan</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Button
          variant={todayMode ? "default" : "outline"}
          size="sm"
          onClick={() => setTodayMode(!todayMode)}
          className="gap-2"
        >
          <Focus className="w-4 h-4" />
          <span className="hidden sm:inline">Today Mode</span>
        </Button>
      </motion.div>

      {/* Today Mode Banner */}
      <AnimatePresence>
        {todayMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-primary/10 rounded-xl text-center"
          >
            <p className="text-sm text-primary font-medium">
              Focus Mode: Showing only today&apos;s essentials
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widgets Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {visibleChildren.map((child, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
