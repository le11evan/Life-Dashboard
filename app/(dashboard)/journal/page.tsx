import { Suspense } from "react";
import { getJournalEntries, getJournalStreak } from "@/lib/actions/journal";
import { JournalClient } from "./journal-client";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; add?: string }>;
}) {
  const params = await searchParams;
  const [entries, streak] = await Promise.all([
    getJournalEntries(params.search),
    getJournalStreak(),
  ]);

  return (
    <Suspense fallback={<JournalSkeleton />}>
      <JournalClient
        initialEntries={entries}
        streak={streak}
        initialSearch={params.search || ""}
        openAdd={params.add === "true"}
      />
    </Suspense>
  );
}

function JournalSkeleton() {
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
