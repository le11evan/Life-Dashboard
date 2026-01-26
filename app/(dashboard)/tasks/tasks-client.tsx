"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import {
  createTask,
  toggleTaskStatus,
  deleteTask,
} from "@/lib/actions/tasks";
import type { Task } from "@prisma/client";

const priorityColors = {
  0: "text-muted-foreground",
  1: "text-blue-500",
  2: "text-yellow-500",
  3: "text-red-500",
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

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter as typeof filter);
    router.push(`/tasks?filter=${newFilter}`);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const task = await createTask({
        title: newTitle.trim(),
        priority: newPriority,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setNewPriority(0);
      setAddOpen(false);
    });
  }

  async function handleToggle(id: string) {
    // Optimistic update
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

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6" />
            Tasks
          </h1>
          <p className="text-muted-foreground">
            {filteredTasks.filter((t) => t.status === "pending").length} pending
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={handleFilterChange} className="mb-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">
            All
          </TabsTrigger>
          <TabsTrigger value="today" className="flex-1 sm:flex-none">
            Today
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-none">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No tasks yet</p>
              <Button
                variant="link"
                onClick={() => setAddOpen(true)}
                className="mt-2"
              >
                Add your first task
              </Button>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Card className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(task.id)}
                      className="mt-0.5 flex-shrink-0"
                      disabled={isPending}
                    >
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        className={
                          task.status === "completed"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </motion.div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {task.priority > 0 && (
                          <span
                            className={`flex items-center gap-1 ${
                              priorityColors[task.priority as keyof typeof priorityColors]
                            }`}
                          >
                            <Flag className="w-3 h-3" />
                            {priorityLabels[task.priority as keyof typeof priorityLabels]}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Task</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddTask} className="space-y-4 pb-8">
            <Input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-12"
              autoFocus
            />

            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground py-2">Priority:</span>
              {([0, 1, 2, 3] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={newPriority === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewPriority(p)}
                  className={newPriority !== p ? priorityColors[p] : ""}
                >
                  {priorityLabels[p]}
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12"
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
