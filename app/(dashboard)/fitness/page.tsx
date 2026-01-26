import { Suspense } from "react";
import { getWorkouts, getWorkoutsThisWeek, getRecentExercises } from "@/lib/actions/fitness";
import { FitnessClient } from "./fitness-client";

export const dynamic = "force-dynamic";

export default async function FitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const params = await searchParams;
  const [workouts, workoutsThisWeek, recentExercises] = await Promise.all([
    getWorkouts(20),
    getWorkoutsThisWeek(),
    getRecentExercises(),
  ]);

  return (
    <Suspense fallback={<FitnessSkeleton />}>
      <FitnessClient
        initialWorkouts={workouts}
        workoutsThisWeek={workoutsThisWeek}
        recentExercises={recentExercises}
        openAdd={params.add === "true"}
      />
    </Suspense>
  );
}

function FitnessSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
