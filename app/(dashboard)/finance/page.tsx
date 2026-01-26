import { Suspense } from "react";
import { getHoldings, getWatchlist, getPortfolioStats } from "@/lib/actions/finance";
import { FinanceClient } from "./finance-client";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [holdings, watchlist, stats] = await Promise.all([
    getHoldings(),
    getWatchlist(),
    getPortfolioStats(),
  ]);

  return (
    <Suspense fallback={<FinanceSkeleton />}>
      <FinanceClient
        initialHoldings={holdings}
        initialWatchlist={watchlist}
        portfolioStats={stats}
      />
    </Suspense>
  );
}

function FinanceSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
