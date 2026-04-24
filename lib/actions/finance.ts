"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createHoldingSchema,
  updateHoldingSchema,
  createWatchlistItemSchema,
  type CreateHoldingInput,
  type UpdateHoldingInput,
  type CreateWatchlistItemInput,
  type StockResearchData,
} from "@/lib/validations/finance";

// ============ Holdings ============

export async function getHoldings() {
  const user = await requireUser();
  return db.holding.findMany({
    where: { userId: user.id },
    orderBy: { symbol: "asc" },
  });
}

export async function getPortfolioStats() {
  const user = await requireUser();
  const holdings = await db.holding.findMany({ where: { userId: user.id } });

  let totalValue = 0;
  let totalCost = 0;

  for (const h of holdings) {
    const price = h.currentPrice ?? h.avgCost;
    totalValue += price * h.shares;
    totalCost += h.avgCost * h.shares;
  }

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    holdingsCount: holdings.length,
  };
}

export async function createHolding(input: CreateHoldingInput) {
  const user = await requireUser();
  const validated = createHoldingSchema.parse(input);

  const holding = await db.holding.create({
    data: {
      userId: user.id,
      symbol: validated.symbol.toUpperCase(),
      shares: validated.shares,
      avgCost: validated.avgCost,
      currentPrice: validated.currentPrice,
      notes: validated.notes,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/");
  return holding;
}

export async function updateHolding(input: UpdateHoldingInput) {
  const user = await requireUser();
  const validated = updateHoldingSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.shares !== undefined) updateData.shares = data.shares;
  if (data.avgCost !== undefined) updateData.avgCost = data.avgCost;
  if (data.currentPrice !== undefined) updateData.currentPrice = data.currentPrice;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const res = await db.holding.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Holding not found");

  revalidatePath("/finance");
  revalidatePath("/");
  return db.holding.findUniqueOrThrow({ where: { id } });
}

export async function deleteHolding(id: string) {
  const user = await requireUser();
  await db.holding.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/finance");
  revalidatePath("/");
}

// ============ Watchlist ============

export async function getWatchlist() {
  const user = await requireUser();
  return db.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createWatchlistItem(input: CreateWatchlistItemInput) {
  const user = await requireUser();
  const validated = createWatchlistItemSchema.parse(input);

  const item = await db.watchlistItem.create({
    data: {
      userId: user.id,
      symbol: validated.symbol.toUpperCase(),
      notes: validated.notes,
    },
  });

  revalidatePath("/finance");
  return item;
}

export async function updateWatchlistItem(id: string, notes: string | null) {
  const user = await requireUser();
  const res = await db.watchlistItem.updateMany({
    where: { id, userId: user.id },
    data: { notes },
  });
  if (res.count === 0) throw new Error("Watchlist item not found");

  revalidatePath("/finance");
  return db.watchlistItem.findUniqueOrThrow({ where: { id } });
}

export async function deleteWatchlistItem(id: string) {
  const user = await requireUser();
  await db.watchlistItem.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/finance");
}

// ============ Research (GLOBAL cache) ============

export async function getCachedResearch(symbol: string): Promise<StockResearchData | null> {
  await requireUser();
  const research = await db.stockResearch.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });

  if (!research) return null;

  const cacheAge = Date.now() - new Date(research.generatedAt).getTime();
  const maxAge = 24 * 60 * 60 * 1000;

  if (cacheAge > maxAge) return null;

  return research.data as unknown as StockResearchData;
}

export async function saveResearch(symbol: string, data: StockResearchData) {
  await requireUser();
  await db.stockResearch.upsert({
    where: { symbol: symbol.toUpperCase() },
    update: {
      data: JSON.parse(JSON.stringify(data)),
      generatedAt: new Date(),
    },
    create: {
      symbol: symbol.toUpperCase(),
      data: JSON.parse(JSON.stringify(data)),
      generatedAt: new Date(),
    },
  });

  revalidatePath("/finance");
}
