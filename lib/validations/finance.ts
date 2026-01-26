import { z } from "zod";

export const createHoldingSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  shares: z.number().positive(),
  avgCost: z.number().min(0),
  currentPrice: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateHoldingSchema = z.object({
  id: z.string().cuid(),
  shares: z.number().positive().optional(),
  avgCost: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createWatchlistItemSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateWatchlistItemSchema = z.object({
  id: z.string().cuid(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
export type CreateWatchlistItemInput = z.infer<typeof createWatchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;

// Research data structure
export interface StockResearchData {
  symbol: string;
  companyName?: string;
  sector?: string;
  summary: string;
  financials: {
    marketCap?: string;
    peRatio?: string;
    eps?: string;
    revenue?: string;
    revenueGrowth?: string;
    profitMargin?: string;
    debtToEquity?: string;
  };
  catalysts: string[];
  risks: string[];
  sentiment: {
    overall: "bullish" | "bearish" | "neutral";
    socialMedia: string;
    analystRating?: string;
  };
  priceTargets: {
    low?: string;
    average?: string;
    high?: string;
  };
  recentNews: string[];
  generatedAt: string;
}
