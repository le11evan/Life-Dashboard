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
import { Chip } from "@/components/ui/chip";
import { Check } from "@/components/ui/check";
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

  const shortCount = goals.filter((g) => g.type === "short" && g.status === "active").length;
  const longCount = goals.filter((g) => g.type === "long" && g.status === "active").length;
  const avgProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
      : 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-16 pb-4">
        <div className="t-kicker mb-2">09 · goals</div>
        <div className="flex items-end justify-between">
          <h1 className="t-display text-[44px] text-[var(--fg)]">Goals</h1>
          <Chip tone="pink">{stats.active} active</Chip>
        </div>
      </div>

      {/* Feature tile */}
      <div className="px-4 pb-3">
        <div className="tile tile--elev edge-pink p-5">
          <div className="t-kicker mb-2">average progress</div>
          <div className="flex items-end justify-between">
            <span className="t-display glow-pink text-[54px] text-[var(--pink)]">
              {avgProgress}%
            </span>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="t-mono text-[12px] text-[var(--fg-dim)]">
                {shortCount} short-term
              </span>
              <span className="t-mono text-[12px] text-[var(--fg-dim)]">
                {longCount} long-term
              </span>
              <span className="t-mono text-[10px] text-[var(--fg-mute)] mt-1">
                {stats.completed} completed
              </span>
            </div>
          </div>
          <div className="bar mt-4">
            <div
              className="bar__fill"
              style={{
                width: `${avgProgress}%`,
                background: "var(--pink)",
                boxShadow: "0 0 6px var(--pink)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Quote */}
      {quote && (
        <div className="px-4 pb-3 text-center">
          <p
            className="t-display italic"
            style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: "var(--fg-dim)" }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            className="t-mono mt-2"
            style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            — {quote.author}
          </p>
        </div>
      )}

      {/* Seg + Add */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="seg flex-1 justify-between">
          <button
            onClick={() => setActiveTab("short")}
            className={`seg__b flex-1 ${activeTab === "short" ? "active" : ""}`}
          >
            short-term
          </button>
          <button
            onClick={() => setActiveTab("long")}
            className={`seg__b flex-1 ${activeTab === "long" ? "active" : ""}`}
          >
            long-term
          </button>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Add goal"
              className="tile tile--elev flex items-center justify-center"
              style={{
                width: 36,
                height: 32,
                borderRadius: 99,
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                color: "#fff",
                border: "none",
                boxShadow: "0 8px 24px -12px rgba(255,45,120,0.6)",
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </DialogTrigger>
              <DialogContent className="bg-[var(--ink-100)] border-[color:var(--line)]">
                <DialogHeader>
                  <DialogTitle className="text-[color:var(--fg)]">New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="What do you want to achieve?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/[0.04] border-[color:var(--line)] text-white"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/[0.04] border-[color:var(--line)] text-white resize-none"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGoalType("short")}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        goalType === "short"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
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
                          : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
                      )}
                    >
                      <Sparkles className="w-4 h-4 mx-auto mb-1" />
                      Long-term
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-[color:var(--fg-mute)] mb-1 block">
                      Target Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="bg-white/[0.04] border-[color:var(--line)] text-white"
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

      {/* Goals List */}
      <div className="px-4 pt-2 space-y-6">
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="t-kicker">in progress</span>
              <span className="t-mono text-[10px] text-[var(--fg-mute)]">
                {activeGoals.length} active
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {activeGoals.map((goal, index) => {
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  const isExpanded = expandedGoal === goal.id;
                  const accentColor = activeTab === "short" ? "var(--cyan)" : "var(--purple)";
                  const checkColor = activeTab === "short" ? "cyan" : undefined;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="tile p-4"
                    >
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      >
                        <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <Check
                            done={false}
                            color={checkColor}
                            onChange={() => handleToggle(goal.id)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-medium text-[var(--fg)]">
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-[12.5px] text-[var(--fg-mute)] mt-1 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {goal.targetDate && (
                              <span
                                className="t-mono text-[10px] flex items-center gap-1"
                                style={{
                                  color:
                                    daysRemaining !== null && daysRemaining < 0
                                      ? "var(--pink)"
                                      : daysRemaining !== null && daysRemaining <= 7
                                      ? "var(--yellow)"
                                      : "var(--fg-mute)",
                                }}
                              >
                                <Calendar className="w-3 h-3" />
                                {daysRemaining !== null && daysRemaining < 0
                                  ? `${Math.abs(daysRemaining)}d overdue`
                                  : daysRemaining !== null && daysRemaining === 0
                                  ? "Due today"
                                  : `${daysRemaining}d left`}
                              </span>
                            )}
                            <span
                              className="t-mono text-[10px]"
                              style={{ color: accentColor }}
                            >
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="bar mt-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              className="bar__fill"
                              style={{
                                background: accentColor,
                                boxShadow: `0 0 6px ${accentColor}`,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 text-[var(--fg-mute)] transition-transform mt-1",
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
                            <div className="pt-4 mt-4 border-t border-[color:var(--line)]">
                              <label className="text-xs text-[color:var(--fg-mute)] mb-2 block">
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
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="t-kicker">completed</span>
              <span className="t-mono text-[10px] text-[var(--fg-mute)]">
                {completedGoals.length} done
              </span>
            </div>
            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="tile p-3"
                >
                  <div className="flex items-center gap-3">
                    <Check done={true} color="lime" onChange={() => handleToggle(goal.id)} />
                    <span
                      className="text-[13px] line-through"
                      style={{ color: "var(--fg-mute)" }}
                    >
                      {goal.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(goal.id)}
                      className="ml-auto"
                      style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                      aria-label="Delete goal"
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
            <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}>
              <Target className="w-7 h-7" style={{ color: "var(--pink)" }} />
            </div>
            <div className="t-display mt-1 text-[22px]" style={{ color: "var(--fg-dim)" }}>
              No {activeTab === "short" ? "short-term" : "long-term"} goals
            </div>
            <p className="t-mono mt-2 mb-4" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
              set your first to start tracking
            </p>
            <Button
              onClick={() => {
                setGoalType(activeTab);
                setIsAddOpen(true);
              }}
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                color: "#fff",
              }}
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
