"use server";

import { db } from "@/lib/db";
import { formatDateLA } from "@/lib/utils";

export async function exportAllData() {
  const [
    tasks,
    workoutTemplates,
    dietLogs,
    dietGoals,
    supplements,
    weightLogs,
    holdings,
    watchlist,
    journalEntries,
    groceryItems,
    goals,
    creativeIdeas,
  ] = await Promise.all([
    db.task.findMany({ orderBy: { createdAt: "desc" } }),
    db.workoutTemplate.findMany({
      include: {
        exercises: {
          include: { logs: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
    db.dietLog.findMany({ orderBy: { date: "desc" } }),
    db.dietGoals.findFirst(),
    db.supplement.findMany({ orderBy: { name: "asc" } }),
    db.weightLog.findMany({ orderBy: { date: "desc" } }),
    db.holding.findMany({ orderBy: { symbol: "asc" } }),
    db.watchlistItem.findMany({ orderBy: { symbol: "asc" } }),
    db.journalEntry.findMany({ orderBy: { createdAt: "desc" } }),
    db.groceryItem.findMany({ orderBy: { createdAt: "desc" } }),
    db.goal.findMany({ orderBy: { createdAt: "desc" } }),
    db.creativeIdea.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    exportedAtLA: formatDateLA(new Date(), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    version: "1.0",
    data: {
      tasks,
      fitness: {
        templates: workoutTemplates,
      },
      diet: {
        logs: dietLogs,
        goals: dietGoals,
        supplements,
        weightLogs,
      },
      finance: {
        holdings,
        watchlist,
      },
      journal: journalEntries,
      groceries: groceryItems,
      goals,
      creative: creativeIdeas,
    },
    stats: {
      tasks: tasks.length,
      workoutTemplates: workoutTemplates.length,
      exercises: workoutTemplates.reduce((acc, t) => acc + t.exercises.length, 0),
      dietLogs: dietLogs.length,
      supplements: supplements.length,
      weightLogs: weightLogs.length,
      holdings: holdings.length,
      watchlistItems: watchlist.length,
      journalEntries: journalEntries.length,
      groceryItems: groceryItems.length,
      goals: goals.length,
      creativeIdeas: creativeIdeas.length,
    },
  };

  return backup;
}

export async function getBackupStats() {
  const [
    tasks,
    templates,
    exercises,
    dietLogs,
    supplements,
    weightLogs,
    holdings,
    watchlist,
    journal,
    groceries,
    goals,
    ideas,
  ] = await Promise.all([
    db.task.count(),
    db.workoutTemplate.count(),
    db.templateExercise.count(),
    db.dietLog.count(),
    db.supplement.count(),
    db.weightLog.count(),
    db.holding.count(),
    db.watchlistItem.count(),
    db.journalEntry.count(),
    db.groceryItem.count(),
    db.goal.count(),
    db.creativeIdea.count(),
  ]);

  return {
    tasks,
    templates,
    exercises,
    dietLogs,
    supplements,
    weightLogs,
    holdings,
    watchlist,
    journal,
    groceries,
    goals,
    ideas,
    total: tasks + templates + exercises + dietLogs + supplements + weightLogs +
           holdings + watchlist + journal + groceries + goals + ideas,
  };
}
