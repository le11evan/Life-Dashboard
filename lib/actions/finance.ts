"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
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
  return db.holding.findMany({
    orderBy: { symbol: "asc" },
  });
}

export async function getPortfolioStats() {
  const holdings = await db.holding.findMany();

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
  const validated = createHoldingSchema.parse(input);

  const holding = await db.holding.create({
    data: {
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
  const validated = updateHoldingSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.shares !== undefined) updateData.shares = data.shares;
  if (data.avgCost !== undefined) updateData.avgCost = data.avgCost;
  if (data.currentPrice !== undefined) updateData.currentPrice = data.currentPrice;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const holding = await db.holding.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/finance");
  revalidatePath("/");
  return holding;
}

export async function deleteHolding(id: string) {
  await db.holding.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/");
}

// ============ Watchlist ============

export async function getWatchlist() {
  return db.watchlistItem.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createWatchlistItem(input: CreateWatchlistItemInput) {
  const validated = createWatchlistItemSchema.parse(input);

  const item = await db.watchlistItem.create({
    data: {
      symbol: validated.symbol.toUpperCase(),
      notes: validated.notes,
    },
  });

  revalidatePath("/finance");
  return item;
}

export async function updateWatchlistItem(id: string, notes: string | null) {
  const item = await db.watchlistItem.update({
    where: { id },
    data: { notes },
  });

  revalidatePath("/finance");
  return item;
}

export async function deleteWatchlistItem(id: string) {
  await db.watchlistItem.delete({ where: { id } });
  revalidatePath("/finance");
}

// ============ Research ============

export async function getCachedResearch(symbol: string): Promise<StockResearchData | null> {
  const research = await db.stockResearch.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });

  if (!research) return null;

  // Check if cache is older than 24 hours
  const cacheAge = Date.now() - new Date(research.generatedAt).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (cacheAge > maxAge) {
    return null; // Cache expired
  }

  return research.data as unknown as StockResearchData;
}

export async function saveResearch(symbol: string, data: StockResearchData) {
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
