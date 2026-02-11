import { Suspense } from "react";
import Link from "next/link";
import {
  CheckSquare,
  ShoppingCart,
  BookOpen,
  Dumbbell,
  Wallet,
  Target,
  ChevronRight,
  Circle,
  Flame,
  Newspaper,
  Lightbulb,
  Sparkles,
  Flag,
  Apple,
  Pill,
  Scale,
} from "lucide-react";
import { getTasks, getTodayTasksCount } from "@/lib/actions/tasks";
import { getGroceryItems, getGroceryItemsCount } from "@/lib/actions/groceries";
import { getJournalStreak, getRecentEntryCount } from "@/lib/actions/journal";
import { getTodayQuote } from "@/lib/actions/quotes";
import { getFitnessStats } from "@/lib/actions/fitness";
import { getDietStats } from "@/lib/actions/diet";
import { getPortfolioStats } from "@/lib/actions/finance";
import { getGoalStats, getGoals } from "@/lib/actions/goals";
import { getIdeaStats } from "@/lib/actions/creative";
import { getDailyNews } from "@/lib/actions/news";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

async function TasksWidget() {
  const [tasks, counts] = await Promise.all([
    getTasks("all"),
    getTodayTasksCount(),
  ]);

  // Show pending tasks first, sorted by priority and due date
  const pendingTasks = tasks
    .filter((t) => t.status === "pending")
    .slice(0, 5);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          Tasks
        </span>
        <Link
          href="/tasks"
          className="text-xs text-slate-400 hover:text-blue-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {pendingTasks.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">No pending tasks</p>
            <Link
              href="/tasks?add=true"
              className="text-sm text-blue-400 hover:underline"
            >
              Add a task
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {pendingTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm text-slate-300">
                <Circle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="truncate">{task.title}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Total pending</span>
          <span className="font-medium text-blue-400">{tasks.filter((t) => t.status === "pending").length}</span>
        </div>
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-slate-500">Completed</span>
          <span className="font-medium text-green-400">{tasks.filter((t) => t.status === "completed").length}</span>
        </div>
      </div>
    </div>
  );
}

async function GroceriesWidget() {
  const [items, counts] = await Promise.all([
    getGroceryItems(),
    getGroceryItemsCount(),
  ]);

  const uncheckedItems = items.filter((i) => !i.isChecked).slice(0, 5);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-green-500/20">
            <ShoppingCart className="w-4 h-4 text-green-400" />
          </div>
          Groceries
        </span>
        <Link
          href="/groceries"
          className="text-xs text-slate-400 hover:text-green-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {uncheckedItems.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">Shopping list is empty</p>
            <Link
              href="/groceries?add=true"
              className="text-sm text-green-400 hover:underline"
            >
              Add an item
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {uncheckedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-slate-300">
                <Circle className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.category && (
                  <span className="text-xs text-slate-500">
                    ({item.category})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Items to get</span>
          <span className="font-medium text-green-400">{counts.unchecked}</span>
        </div>
      </div>
    </div>
  );
}

async function QuoteWidget() {
  const quote = await getTodayQuote();

  return (
    <div className="rounded-2xl p-4 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
      <div className="flex items-center gap-2 text-base font-medium text-white mb-3">
        <div className="p-1.5 rounded-lg bg-purple-500/20">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        Daily Inspiration
      </div>
      <div className="py-4">
        <p className="text-sm italic text-purple-200/80">
          &ldquo;{quote.quote}&rdquo;
        </p>
        {quote.author && (
          <p className="text-xs text-purple-400 mt-2">- {quote.author}</p>
        )}
      </div>
    </div>
  );
}

async function JournalWidget() {
  const [streak, recentCount] = await Promise.all([
    getJournalStreak(),
    getRecentEntryCount(),
  ]);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          Journal
        </span>
        <Link
          href="/journal"
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        <div className="py-4 text-center">
          {streak > 0 ? (
            <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-sm">day streak!</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-2">
              Start your journaling streak
            </p>
          )}
          <Link
            href="/journal?add=true"
            className="text-sm text-amber-400 hover:underline"
          >
            Write today&apos;s entry
          </Link>
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Last 30 days</span>
          <span className="font-medium text-amber-400">{recentCount} entries</span>
        </div>
      </div>
    </div>
  );
}

async function FitnessWidget() {
  const stats = await getFitnessStats();

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 hover:border-red-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-red-500/20">
            <Dumbbell className="w-4 h-4 text-red-400" />
          </div>
          Fitness
        </span>
        <Link
          href="/fitness"
          className="text-xs text-slate-400 hover:text-red-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {stats.templateCount === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">No workouts created</p>
            <Link
              href="/fitness?add=true"
              className="text-sm text-red-400 hover:underline"
            >
              Create a workout
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-red-400">{stats.templateCount}</p>
                <p className="text-xs text-slate-500">workouts</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-red-400">{stats.exerciseCount}</p>
                <p className="text-xs text-slate-500">exercises</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/5 text-sm">
          <span className="flex items-center gap-1 text-slate-500">
            <Flame className="w-3 h-3" />
            Logged this week
          </span>
          <span className="font-medium text-red-400">{stats.workoutsThisWeek}</span>
        </div>
      </div>
    </div>
  );
}

async function DietWidget() {
  const stats = await getDietStats();

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-lime-500/10 to-green-500/5 border border-lime-500/20 hover:border-lime-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <Apple className="w-4 h-4 text-lime-400" />
          </div>
          Diet
        </span>
        <Link
          href="/diet"
          className="text-xs text-slate-400 hover:text-lime-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-lime-400">{stats.goals.calories}</p>
            <p className="text-xs text-slate-500">cal goal</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-lime-400">{stats.goals.protein}g</p>
            <p className="text-xs text-slate-500">protein</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/5 text-sm">
          <span className="flex items-center gap-1 text-slate-500">
            <Pill className="w-3 h-3" />
            Active supplements
          </span>
          <span className="font-medium text-lime-400">{stats.activeSupplements}</span>
        </div>
        {stats.currentWeight && (
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="flex items-center gap-1 text-slate-500">
              <Scale className="w-3 h-3" />
              Current weight
            </span>
            <span className="font-medium text-lime-400">{stats.currentWeight} lbs</span>
          </div>
        )}
      </div>
    </div>
  );
}

async function FinanceWidget() {
  const stats = await getPortfolioStats();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-emerald-500/20">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          Finance
        </span>
        <Link
          href="/finance"
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {stats.holdingsCount === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">No positions yet</p>
            <Link
              href="/finance"
              className="text-sm text-emerald-400 hover:underline"
            >
              Add a position
            </Link>
          </div>
        ) : (
          <div>
            <div className="text-center py-2">
              <p
                className={`text-2xl font-bold ${
                  stats.totalGainPercent >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatPercent(stats.totalGainPercent)}
              </p>
              <p className="text-sm text-slate-400">
                {formatCurrency(stats.totalGain)} all time
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Positions</span>
          <span className="font-medium text-emerald-400">{stats.holdingsCount}</span>
        </div>
      </div>
    </div>
  );
}

async function GoalsWidget() {
  const [stats, goals] = await Promise.all([
    getGoalStats(),
    getGoals("short"),
  ]);

  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 hover:border-violet-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-violet-500/20">
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          Goals
        </span>
        <Link
          href="/goals"
          className="text-xs text-slate-400 hover:text-violet-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {stats.active === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">No active goals</p>
            <Link
              href="/goals"
              className="text-sm text-violet-400 hover:underline"
            >
              Set a goal
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2">
                {goal.type === "short" ? (
                  <Flag className="w-3 h-3 text-blue-400 flex-shrink-0" />
                ) : (
                  <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                )}
                <span className="text-sm truncate flex-1 text-slate-300">{goal.title}</span>
                <span className="text-xs text-slate-500">{goal.progress}%</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Active</span>
          <span className="font-medium text-violet-400">{stats.active}</span>
        </div>
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-slate-500">Completed</span>
          <span className="font-medium text-green-400">{stats.completed}</span>
        </div>
      </div>
    </div>
  );
}

async function NewsWidget() {
  const data = await getDailyNews();
  const topArticles = data.articles.slice(0, 3);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <Newspaper className="w-4 h-4 text-cyan-400" />
          </div>
          Daily News
        </span>
        <Link
          href="/learn"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        {topArticles.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400">No news available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topArticles.map((article, i) => (
              <div key={i} className="border-b border-white/5 pb-2 last:border-0">
                <span className="text-xs text-cyan-400">{article.category}</span>
                <p className="text-sm text-slate-300 line-clamp-1">{article.title}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/5 text-sm">
          <span className="text-slate-500">Articles today</span>
          <span className="font-medium text-cyan-400">{data.articles.length}</span>
        </div>
      </div>
    </div>
  );
}

async function CreativeWidget() {
  const stats = await getIdeaStats();

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 hover:border-yellow-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-base font-medium text-white">
          <div className="p-1.5 rounded-lg bg-yellow-500/20">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
          </div>
          Ideas
        </span>
        <Link
          href="/creative"
          className="text-xs text-slate-400 hover:text-yellow-400 flex items-center transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div>
        <div className="py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-sm text-slate-400">ideas captured</span>
          </div>
          <Link
            href="/creative"
            className="text-sm text-yellow-400 hover:underline"
          >
            Add new idea
          </Link>
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-sm">
          <span className="text-slate-500">Pinned</span>
          <span className="font-medium text-yellow-400">{stats.pinned}</span>
        </div>
      </div>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="rounded-2xl p-4 bg-slate-800/30 border border-white/5">
      <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-700/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardClient greeting={greeting} today={today}>
      {/* Priority widgets - most used */}
      <Suspense fallback={<WidgetSkeleton />}>
        <TasksWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <FitnessWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <DietWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <FinanceWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <JournalWidget />
      </Suspense>

      {/* Secondary widgets */}
      <Suspense fallback={<WidgetSkeleton />}>
        <GoalsWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <GroceriesWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <QuoteWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <NewsWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <CreativeWidget />
      </Suspense>
    </DashboardClient>
  );
}
