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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, getTodayTasksCount } from "@/lib/actions/tasks";
import { getGroceryItems, getGroceryItemsCount } from "@/lib/actions/groceries";
import { getJournalStreak, getRecentEntryCount } from "@/lib/actions/journal";
import { getTodayQuote } from "@/lib/actions/quotes";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

async function TasksWidget() {
  const [tasks, counts] = await Promise.all([
    getTasks("today"),
    getTodayTasksCount(),
  ]);

  const recentTasks = tasks.slice(0, 5);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-medium">
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
            Today&apos;s Tasks
          </span>
          <Link
            href="/tasks"
            className="text-xs text-muted-foreground hover:text-primary flex items-center"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTasks.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">No tasks for today</p>
            <Link
              href="/tasks?add=true"
              className="text-sm text-primary hover:underline"
            >
              Add a task
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {recentTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{task.title}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t text-sm">
          <span className="text-muted-foreground">Pending</span>
          <span className="font-medium">{counts.pending}</span>
        </div>
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-muted-foreground">Completed today</span>
          <span className="font-medium">{counts.completed}</span>
        </div>
      </CardContent>
    </Card>
  );
}

async function GroceriesWidget() {
  const [items, counts] = await Promise.all([
    getGroceryItems(),
    getGroceryItemsCount(),
  ]);

  const uncheckedItems = items.filter((i) => !i.isChecked).slice(0, 5);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-medium">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            Groceries
          </span>
          <Link
            href="/groceries"
            className="text-xs text-muted-foreground hover:text-primary flex items-center"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uncheckedItems.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Shopping list is empty</p>
            <Link
              href="/groceries?add=true"
              className="text-sm text-primary hover:underline"
            >
              Add an item
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {uncheckedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.category && (
                  <span className="text-xs text-muted-foreground">
                    ({item.category})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t text-sm">
          <span className="text-muted-foreground">Items to get</span>
          <span className="font-medium">{counts.unchecked}</span>
        </div>
      </CardContent>
    </Card>
  );
}

async function QuoteWidget() {
  const quote = await getTodayQuote();

  return (
    <Card className="rounded-2xl md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Daily Quote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{quote.quote}&rdquo;
          </p>
          {quote.author && (
            <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function JournalWidget() {
  const [streak, recentCount] = await Promise.all([
    getJournalStreak(),
    getRecentEntryCount(),
  ]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-medium">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Journal
          </span>
          <Link
            href="/journal"
            className="text-xs text-muted-foreground hover:text-primary flex items-center"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-4 text-center">
          {streak > 0 ? (
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-sm">day streak!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-2">
              Start your journaling streak
            </p>
          )}
          <Link
            href="/journal?add=true"
            className="text-sm text-primary hover:underline"
          >
            Write today&apos;s entry
          </Link>
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t text-sm">
          <span className="text-muted-foreground">Last 30 days</span>
          <span className="font-medium">{recentCount} entries</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderWidget({
  title,
  icon: Icon,
  message,
  milestone,
}: {
  title: string;
  icon: React.ElementType;
  message: string;
  milestone: number;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coming in Milestone {milestone}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
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
      <Suspense fallback={<WidgetSkeleton />}>
        <TasksWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <GroceriesWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <QuoteWidget />
      </Suspense>

      <Suspense fallback={<WidgetSkeleton />}>
        <JournalWidget />
      </Suspense>

      <PlaceholderWidget
        title="Fitness"
        icon={Dumbbell}
        message="No workouts this week"
        milestone={4}
      />

      <PlaceholderWidget
        title="Finance"
        icon={Wallet}
        message="No bills due soon"
        milestone={5}
      />

      <PlaceholderWidget
        title="Goals"
        icon={Target}
        message="No active goals"
        milestone={6}
      />
    </DashboardClient>
  );
}
