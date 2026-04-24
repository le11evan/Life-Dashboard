import { requireUser } from "@/lib/session";
import { getTasks } from "@/lib/actions/tasks";
import { getGroceryItems } from "@/lib/actions/groceries";
import { getJournalStreak, getJournalEntries } from "@/lib/actions/journal";
import { getTodayQuote } from "@/lib/actions/quotes";
import { getFitnessStats } from "@/lib/actions/fitness";
import { getDietStats, getDietLog } from "@/lib/actions/diet";
import { getPortfolioStats } from "@/lib/actions/finance";
import { getGoals } from "@/lib/actions/goals";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [
    tasks,
    groceries,
    journalStreak,
    recentEntries,
    quote,
    fitnessStats,
    dietStats,
    todayDiet,
    portfolio,
    shortGoals,
  ] = await Promise.all([
    getTasks("all"),
    getGroceryItems(),
    getJournalStreak(),
    getJournalEntries(),
    getTodayQuote(),
    getFitnessStats(),
    getDietStats(),
    getDietLog(),
    getPortfolioStats(),
    getGoals("short"),
  ]);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const uncheckedGroceries = groceries.filter((g) => !g.isChecked);
  const latestEntry = recentEntries[0] ?? null;
  const activeGoals = shortGoals.filter((g) => g.status === "active").slice(0, 3);

  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const weekPattern = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return recentEntries.some((e) => {
      const d = new Date(e.createdAt);
      return d >= start && d < end;
    })
      ? 1
      : 0;
  });

  return (
    <DashboardClient
      name={user.username}
      streak={journalStreak}
      weekPattern={weekPattern}
      todayIdx={dayOfWeek}
      tasks={{
        pending: pendingTasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
        })),
        completedToday,
        totalToday: tasks.length,
      }}
      groceries={{
        items: uncheckedGroceries.map((g) => ({
          id: g.id,
          name: g.name,
          category: g.category,
        })),
        total: uncheckedGroceries.length,
      }}
      fitness={{
        workoutsThisWeek: fitnessStats.workoutsThisWeek,
        templateCount: fitnessStats.templateCount,
        exerciseCount: fitnessStats.exerciseCount,
      }}
      diet={{
        calorieGoal: dietStats.goals.calories,
        proteinGoal: dietStats.goals.protein,
        carbsGoal: dietStats.goals.carbs,
        fatGoal: dietStats.goals.fat,
        caloriesLogged: todayDiet?.calories ?? 0,
        proteinLogged: todayDiet?.protein ?? 0,
        carbsLogged: todayDiet?.carbs ?? 0,
        fatLogged: todayDiet?.fat ?? 0,
        supplements: dietStats.activeSupplements,
        currentWeight: dietStats.currentWeight,
      }}
      portfolio={{
        totalValue: portfolio.totalValue,
        totalGain: portfolio.totalGain,
        totalGainPercent: portfolio.totalGainPercent,
        holdings: portfolio.holdingsCount,
      }}
      goals={activeGoals.map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
      }))}
      journal={{
        streak: journalStreak,
        latest: latestEntry
          ? {
              content: latestEntry.content,
              mood: latestEntry.mood,
              tags: latestEntry.tags ?? [],
            }
          : null,
      }}
      quote={{ text: quote.quote, author: quote.author ?? undefined }}
    />
  );
}
