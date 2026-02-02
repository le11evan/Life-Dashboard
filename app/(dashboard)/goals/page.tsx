"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronRight,
  Trash2,
  Sparkles,
  Flag,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getGoals,
  getGoalStats,
  createGoal,
  deleteGoal,
  toggleGoalComplete,
  updateGoal,
} from "@/lib/actions/goals";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  progress: number;
  targetDate: Date | null;
  createdAt: Date;
}

interface GoalStats {
  total: number;
  active: number;
  completed: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats>({ total: 0, active: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState<"short" | "long">("short");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalType, setGoalType] = useState<"short" | "long">("short");

  const loadData = useCallback(async () => {
    const [goalsData, statsData] = await Promise.all([
      getGoals(activeTab),
      getGoalStats(),
    ]);
    setGoals(goalsData);
    setStats(statsData);
  }, [activeTab]);

  useEffect(() => {
    const init = async () => {
      await loadData();
      setQuote(getQuoteForCategory("goals"));
    };
    init();
  }, [loadData]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      type: goalType,
      targetDate: targetDate || undefined,
    });

    setTitle("");
    setDescription("");
    setTargetDate("");
    setGoalType("short");
    setIsAddOpen(false);
    loadData();
  };

  const handleToggle = async (id: string) => {
    await toggleGoalComplete(id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
    loadData();
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    await updateGoal({ id, progress });
    loadData();
  };

  const filteredGoals = goals.filter((g) => g.type === activeTab);
  const activeGoals = filteredGoals.filter((g) => g.status === "active");
  const completedGoals = filteredGoals.filter((g) => g.status === "completed");

  const getDaysRemaining = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Goals</h1>
                <p className="text-xs text-slate-400">
                  {stats.active} active, {stats.completed} completed
                </p>
              </div>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="What do you want to achieve?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white resize-none"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGoalType("short")}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        goalType === "short"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-slate-800 border-white/10 text-slate-400"
                      )}
                    >
                      <Flag className="w-4 h-4 mx-auto mb-1" />
                      Short-term
                    </button>
                    <button
                      onClick={() => setGoalType("long")}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        goalType === "long"
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                          : "bg-slate-800 border-white/10 text-slate-400"
                      )}
                    >
                      <Sparkles className="w-4 h-4 mx-auto mb-1" />
                      Long-term
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Target Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="bg-slate-800 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={!title.trim()}
                  >
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            >
              <p className="text-sm text-purple-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-purple-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("short")}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                activeTab === "short"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-800/50 text-slate-400"
              )}
            >
              <Flag className="w-4 h-4 inline mr-2" />
              Short-term
            </button>
            <button
              onClick={() => setActiveTab("long")}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                activeTab === "long"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-slate-800/50 text-slate-400"
              )}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Long-term
            </button>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="px-4 py-4 space-y-6">
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              In Progress ({activeGoals.length})
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {activeGoals.map((goal, index) => {
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  const isExpanded = expandedGoal === goal.id;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all",
                        activeTab === "short"
                          ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20"
                          : "bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20"
                      )}
                    >
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(goal.id);
                          }}
                          className="mt-0.5"
                        >
                          <Circle
                            className={cn(
                              "w-5 h-5 transition-colors",
                              activeTab === "short"
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-purple-400 hover:text-purple-300"
                            )}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {goal.targetDate && (
                              <span
                                className={cn(
                                  "text-xs flex items-center gap-1",
                                  daysRemaining !== null && daysRemaining < 0
                                    ? "text-red-400"
                                    : daysRemaining !== null && daysRemaining <= 7
                                    ? "text-yellow-400"
                                    : "text-slate-400"
                                )}
                              >
                                <Calendar className="w-3 h-3" />
                                {daysRemaining !== null && daysRemaining < 0
                                  ? `${Math.abs(daysRemaining)}d overdue`
                                  : daysRemaining !== null && daysRemaining === 0
                                  ? "Due today"
                                  : `${daysRemaining}d left`}
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              {goal.progress}% complete
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              className={cn(
                                "h-full rounded-full",
                                activeTab === "short"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                                  : "bg-gradient-to-r from-purple-500 to-pink-400"
                              )}
                            />
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 text-slate-500 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-white/10">
                              <label className="text-xs text-slate-400 mb-2 block">
                                Update Progress
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={goal.progress}
                                  onChange={(e) =>
                                    handleProgressUpdate(goal.id, parseInt(e.target.value))
                                  }
                                  className="flex-1 accent-purple-500"
                                />
                                <span className="text-sm text-white w-12 text-right">
                                  {goal.progress}%
                                </span>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(goal.id)}
                                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Completed ({completedGoals.length})
            </h2>
            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-slate-800/30 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(goal.id)}>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </button>
                    <span className="text-slate-400 line-through">{goal.title}</span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="ml-auto text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No {activeTab === "short" ? "short-term" : "long-term"} goals yet
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Set your first goal to start tracking your progress
            </p>
            <Button
              onClick={() => {
                setGoalType(activeTab);
                setIsAddOpen(true);
              }}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === "short" ? "Short-term" : "Long-term"} Goal
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
