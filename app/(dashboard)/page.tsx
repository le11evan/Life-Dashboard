"use client";

import { motion } from "framer-motion";
import { CheckSquare, ShoppingCart, BookOpen, Dumbbell, Wallet, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function DashboardWidget({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className={`rounded-2xl ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Icon className="w-4 h-4 text-muted-foreground" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold">Good morning, Evan</h1>
        <p className="text-muted-foreground">{today}</p>
      </motion.div>

      {/* Widgets Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Today's Tasks */}
        <DashboardWidget title="Today's Tasks" icon={CheckSquare}>
          <EmptyState message="No tasks for today" />
          <StatChip label="Pending" value={0} />
          <StatChip label="Completed" value={0} />
        </DashboardWidget>

        {/* Groceries */}
        <DashboardWidget title="Groceries" icon={ShoppingCart}>
          <EmptyState message="Shopping list is empty" />
          <StatChip label="Items" value={0} />
        </DashboardWidget>

        {/* Daily Quote */}
        <DashboardWidget title="Daily Quote" icon={BookOpen} className="md:col-span-2 lg:col-span-1">
          <div className="py-4">
            <p className="text-sm italic text-muted-foreground">
              &ldquo;The only way to do great work is to love what you do.&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Steve Jobs</p>
          </div>
        </DashboardWidget>

        {/* Fitness Summary */}
        <DashboardWidget title="Fitness" icon={Dumbbell}>
          <EmptyState message="No workouts this week" />
          <StatChip label="This week" value="0 workouts" />
          <StatChip label="Streak" value="0 days" />
        </DashboardWidget>

        {/* Finance */}
        <DashboardWidget title="Finance" icon={Wallet}>
          <EmptyState message="No bills due soon" />
          <StatChip label="Due this week" value={0} />
        </DashboardWidget>

        {/* Goals */}
        <DashboardWidget title="Goals" icon={Target}>
          <EmptyState message="No active goals" />
          <StatChip label="In progress" value={0} />
        </DashboardWidget>
      </motion.div>
    </div>
  );
}
