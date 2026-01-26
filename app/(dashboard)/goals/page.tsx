"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" />
          Goals
        </h1>
        <p className="text-muted-foreground">Track your objectives</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Goals module coming in Milestone 6</p>
      </motion.div>
    </div>
  );
}
