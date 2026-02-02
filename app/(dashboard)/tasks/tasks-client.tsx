"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  Calendar,
  Flag,
  ListTodo,
  Clock,
  AlertCircle,
  CalendarDays,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  createTask,
  toggleTaskStatus,
  deleteTask,
} from "@/lib/actions/tasks";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";
import type { Task } from "@prisma/client";

const priorityColors = {
  0: "text-slate-400",
  1: "text-blue-400",
  2: "text-yellow-400",
  3: "text-red-400",
};

const priorityBg = {
  0: "bg-slate-500/10 border-slate-500/20",
  1: "bg-blue-500/10 border-blue-500/20",
  2: "bg-yellow-500/10 border-yellow-500/20",
  3: "bg-red-500/10 border-red-500/20",
};

const priorityLabels = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
};

interface TasksClientProps {
  initialTasks: Task[];
  initialFilter: "all" | "today" | "completed";
  openAdd?: boolean;
}

// Helper functions for date handling
function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTomorrow() {
  const date = getToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function getNextWeek() {
  const date = getToday();
  date.setDate(date.getDate() + 7);
  return date;
}

function formatDateForInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDueDateStatus(dueDate: Date | null) {
  if (!dueDate) return null;

  const today = getToday();
  const tomorrow = getTomorrow();
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "this-week";
  return "later";
}

function formatDueDate(dueDate: Date | null) {
  if (!dueDate) return null;

  const status = getDueDateStatus(dueDate);
  const date = new Date(dueDate);

  switch (status) {
    case "overdue":
      const daysOverdue = Math.floor((getToday().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue === 1 ? "Yesterday" : `${daysOverdue} days overdue`;
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "this-week":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    default:
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

const dueDateStyles = {
  overdue: "text-red-400 bg-red-500/10",
  today: "text-blue-400 bg-blue-500/10",
  tomorrow: "text-amber-400 bg-amber-500/10",
  "this-week": "text-green-400 bg-green-500/10",
  later: "text-slate-400 bg-slate-500/10",
};

export function TasksClient({
  initialTasks,
  initialFilter,
  openAdd = false,
}: TasksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState(initialFilter);
  const [addOpen, setAddOpen] = useState(openAdd);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState(0);
  const [newDueDate, setNewDueDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getQuoteForCategory("tasks"));
  }, []);

  function handleFilterChange(newFilter: "all" | "today" | "completed") {
    setFilter(newFilter);
    router.push(`/tasks?filter=${newFilter}`);
  }

  function handleQuickDate(type: "today" | "tomorrow" | "next-week" | "clear") {
    if (type === "clear") {
      setNewDueDate(null);
      setShowDatePicker(false);
      return;
    }

    let date: Date;
    switch (type) {
      case "today":
        date = getToday();
        break;
      case "tomorrow":
        date = getTomorrow();
        break;
      case "next-week":
        date = getNextWeek();
        break;
    }
    setNewDueDate(date.toISOString());
    setShowDatePicker(false);
  }

  function handleCustomDate(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      setNewDueDate(date.toISOString());
    }
    setShowDatePicker(false);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const task = await createTask({
        title: newTitle.trim(),
        priority: newPriority,
        dueDate: newDueDate,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setNewPriority(0);
      setNewDueDate(null);
      setAddOpen(false);
    });
  }

  async function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
          : t
      )
    );

    startTransition(async () => {
      await toggleTaskStatus(id);
    });
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      await deleteTask(id);
    });
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "today") return task.status === "pending";
    return true;
  });

  // Sort tasks: overdue first, then by due date, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;

    // Both pending - sort by due date and priority
    const aStatus = getDueDateStatus(a.dueDate);
    const bStatus = getDueDateStatus(b.dueDate);

    // Overdue tasks first
    if (aStatus === "overdue" && bStatus !== "overdue") return -1;
    if (aStatus !== "overdue" && bStatus === "overdue") return 1;

    // Then by due date
    if (a.dueDate && b.dueDate) {
      const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateDiff !== 0) return dateDiff;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Then by priority (high first)
    return b.priority - a.priority;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount = tasks.filter((t) => t.status === "pending" && getDueDateStatus(t.dueDate) === "overdue").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <CheckSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tasks</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{pendingCount} pending, {completedCount} done</span>
                  {overdueCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      {overdueCount} overdue
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <p className="text-sm text-blue-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-blue-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", icon: ListTodo },
              { key: "today", label: "Today", icon: Clock },
              { key: "completed", label: "Done", icon: CheckCircle2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as typeof filter)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  filter === key
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800/50 text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No tasks here</h3>
              <p className="text-slate-400 text-sm mb-4">
                {filter === "completed"
                  ? "Nothing completed yet"
                  : "Add a task to get started"}
              </p>
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </motion.div>
          ) : (
            sortedTasks.map((task, index) => {
              const dueDateStatus = getDueDateStatus(task.dueDate);
              const formattedDueDate = formatDueDate(task.dueDate);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all",
                    task.status === "completed"
                      ? "bg-slate-800/30 border-white/5"
                      : dueDateStatus === "overdue"
                      ? "bg-gradient-to-br from-red-500/15 to-red-500/5 border-red-500/30"
                      : `bg-gradient-to-br ${priorityBg[task.priority as keyof typeof priorityBg]}`
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(task.id)}
                      className="mt-0.5 flex-shrink-0"
                      disabled={isPending}
                    >
                      <motion.div whileTap={{ scale: 0.8 }}>
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle
                            className={cn(
                              "w-5 h-5 transition-colors",
                              dueDateStatus === "overdue"
                                ? "text-red-400"
                                : priorityColors[task.priority as keyof typeof priorityColors]
                            )}
                          />
                        )}
                      </motion.div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium",
                          task.status === "completed"
                            ? "line-through text-slate-500"
                            : "text-white"
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {task.priority > 0 && task.status !== "completed" && (
                          <span
                            className={cn(
                              "text-xs flex items-center gap-1 px-2 py-0.5 rounded-full",
                              priorityColors[task.priority as keyof typeof priorityColors],
                              "bg-white/5"
                            )}
                          >
                            <Flag className="w-3 h-3" />
                            {priorityLabels[task.priority as keyof typeof priorityLabels]}
                          </span>
                        )}
                        {formattedDueDate && task.status !== "completed" && (
                          <span
                            className={cn(
                              "text-xs flex items-center gap-1 px-2 py-0.5 rounded-full",
                              dueDateStatus && dueDateStyles[dueDateStatus]
                            )}
                          >
                            {dueDateStatus === "overdue" ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Calendar className="w-3 h-3" />
                            )}
                            {formattedDueDate}
                          </span>
                        )}
                        {formattedDueDate && task.status === "completed" && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Add Task</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddTask} className="space-y-4 pb-8">
            <Input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
              autoFocus
            />

            {/* Due Date */}
            <div>
              <span className="text-sm text-slate-400 mb-2 block">Due Date</span>

              {newDueDate ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <CalendarDays className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">
                      {new Date(newDueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickDate("clear")}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDate("today")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                    newDueDate && new Date(newDueDate).toDateString() === getToday().toDateString()
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                      : "bg-slate-800 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-blue-400"
                  )}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate("tomorrow")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                    newDueDate && new Date(newDueDate).toDateString() === getTomorrow().toDateString()
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-slate-800 border-white/10 text-slate-400 hover:border-amber-500/30 hover:text-amber-400"
                  )}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate("next-week")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                    newDueDate && new Date(newDueDate).toDateString() === getNextWeek().toDateString()
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-slate-800 border-white/10 text-slate-400 hover:border-green-500/30 hover:text-green-400"
                  )}
                >
                  Next Week
                </button>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-1",
                    showDatePicker
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-400"
                      : "bg-slate-800 border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-violet-400"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Pick Date
                </button>
              </div>

              {/* Custom Date Picker */}
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <input
                      type="date"
                      min={formatDateForInput(getToday())}
                      onChange={(e) => handleCustomDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Priority */}
            <div>
              <span className="text-sm text-slate-400 mb-2 block">Priority</span>
              <div className="grid grid-cols-4 gap-2">
                {([0, 1, 2, 3] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-sm font-medium transition-all border",
                      newPriority === p
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-800 border-white/10 text-slate-400"
                    )}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600"
              disabled={isPending || !newTitle.trim()}
            >
              {isPending ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
