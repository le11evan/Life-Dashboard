import { Suspense } from "react";
import { getGroceryItems } from "@/lib/actions/groceries";
import { GroceriesClient } from "./groceries-client";

export const dynamic = "force-dynamic";

export default async function GroceriesPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const params = await searchParams;
  const items = await getGroceryItems();

  return (
    <Suspense fallback={<GroceriesSkeleton />}>
      <GroceriesClient initialItems={items} openAdd={params.add === "true"} />
    </Suspense>
  );
}

function GroceriesSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
