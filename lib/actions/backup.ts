"use server";

import { db } from "@/lib/db";
import { formatDateLA } from "@/lib/utils";
import { requireUser } from "@/lib/session";

export async function exportAllData() {
  const user = await requireUser();
  const scope = { userId: user.id };

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
    db.task.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
    db.workoutTemplate.findMany({
      where: scope,
      include: {
        exercises: {
          include: { logs: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
    db.dietLog.findMany({ where: scope, orderBy: { date: "desc" } }),
    db.dietGoals.findUnique({ where: { userId: user.id } }),
    db.supplement.findMany({ where: scope, orderBy: { name: "asc" } }),
    db.weightLog.findMany({ where: scope, orderBy: { date: "desc" } }),
    db.holding.findMany({ where: scope, orderBy: { symbol: "asc" } }),
    db.watchlistItem.findMany({ where: scope, orderBy: { symbol: "asc" } }),
    db.journalEntry.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
    db.groceryItem.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
    db.goal.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
    db.creativeIdea.findMany({ where: scope, orderBy: { createdAt: "desc" } }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    exportedAtLA: formatDateLA(new Date(), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    version: "1.0",
    user: { username: user.username },
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
  const user = await requireUser();
  const scope = { userId: user.id };

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
    db.task.count({ where: scope }),
    db.workoutTemplate.count({ where: scope }),
    db.templateExercise.count({ where: { template: { userId: user.id } } }),
    db.dietLog.count({ where: scope }),
    db.supplement.count({ where: scope }),
    db.weightLog.count({ where: scope }),
    db.holding.count({ where: scope }),
    db.watchlistItem.count({ where: scope }),
    db.journalEntry.count({ where: scope }),
    db.groceryItem.count({ where: scope }),
    db.goal.count({ where: scope }),
    db.creativeIdea.count({ where: scope }),
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
    total:
      tasks +
      templates +
      exercises +
      dietLogs +
      supplements +
      weightLogs +
      holdings +
      watchlist +
      journal +
      groceries +
      goals +
      ideas,
  };
}
