import { Suspense } from "react";
import {
  getDietGoals,
  getSupplements,
  getWeightLogs,
  getLatestWeight,
} from "@/lib/actions/diet";
import { DietClient } from "./diet-client";

export const dynamic = "force-dynamic";

export default async function DietPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const params = await searchParams;
  const [dietGoals, supplements, weightLogs, latestWeight] = await Promise.all([
    getDietGoals(),
    getSupplements(),
    getWeightLogs(30),
    getLatestWeight(),
  ]);

  return (
    <Suspense fallback={<DietSkeleton />}>
      <DietClient
        dietGoals={dietGoals}
        supplements={supplements}
        weightLogs={weightLogs}
        latestWeight={latestWeight}
        openAdd={params.add === "true"}
      />
    </Suspense>
  );
}

function DietSkeleton() {
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
