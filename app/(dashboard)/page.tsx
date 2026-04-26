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

// Wrap a fetcher so one failure doesn't crash the whole dashboard.
// Logs the failing source so we can find it in Vercel logs.
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[dashboard] ${label} failed:`, err);
    return fallback;
  }
}

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
    safe("getTasks", () => getTasks("all"), []),
    safe("getGroceryItems", () => getGroceryItems(), []),
    safe("getJournalStreak", () => getJournalStreak(), 0),
    safe("getJournalEntries", () => getJournalEntries(), []),
    safe("getTodayQuote", () => getTodayQuote(), {
      id: "fallback",
      date: new Date(),
      quote: "Begin where you are.",
      author: null,
      source: null,
      createdAt: new Date(),
    }),
    safe("getFitnessStats", () => getFitnessStats(), {
      workoutsThisWeek: 0,
      templateCount: 0,
      exerciseCount: 0,
    }),
    safe("getDietStats", () => getDietStats(), {
      activeSupplements: 0,
      currentWeight: null as number | null,
      goals: {
        id: "fallback",
        userId: user.id,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
        fiber: 30,
        water: 100,
        updatedAt: new Date(),
      },
    }),
    safe("getDietLog", () => getDietLog(), null),
    safe("getPortfolioStats", () => getPortfolioStats(), {
      totalValue: 0,
      totalCost: 0,
      totalGain: 0,
      totalGainPercent: 0,
      holdingsCount: 0,
    }),
    safe("getGoals", () => getGoals("short"), []),
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
