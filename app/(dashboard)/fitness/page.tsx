import { Suspense } from "react";
import { getWorkoutTemplates } from "@/lib/actions/fitness";
import { FitnessClient } from "./fitness-client";

export const dynamic = "force-dynamic";

export default async function FitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; template?: string }>;
}) {
  const params = await searchParams;
  const templates = await getWorkoutTemplates();

  return (
    <Suspense fallback={<FitnessSkeleton />}>
      <FitnessClient
        templates={templates}
        openAdd={params.add === "true"}
        selectedTemplateId={params.template}
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
