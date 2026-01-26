import { Suspense } from "react";
import { getTasks } from "@/lib/actions/tasks";
import { TasksClient } from "./tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; add?: string }>;
}) {
  const params = await searchParams;
  const filter = (params.filter as "all" | "today" | "completed") || "all";
  const tasks = await getTasks(filter);

  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksClient
        initialTasks={tasks}
        initialFilter={filter}
        openAdd={params.add === "true"}
      />
    </Suspense>
  );
}

function TasksSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
