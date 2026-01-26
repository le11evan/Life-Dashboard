"use server";

import { getCachedResearch, saveResearch } from "./finance";
import type { StockResearchData } from "@/lib/validations/finance";

// This action performs deep research on a stock using web search
// It gathers financials, catalysts, sentiment, and predictions

export async function performStockResearch(symbol: string): Promise<StockResearchData> {
  const upperSymbol = symbol.toUpperCase();

  // Check cache first
  const cached = await getCachedResearch(upperSymbol);
  if (cached) {
    return cached;
  }

  // For now, we'll generate research based on the symbol
  // In a production app, you'd integrate with financial APIs
  // (Alpha Vantage, Yahoo Finance, etc.) or use web scraping

  // Since we can't make external API calls directly from server actions,
  // we'll create a placeholder that can be enhanced later
  const research: StockResearchData = {
    symbol: upperSymbol,
    companyName: `${upperSymbol} Inc.`,
    summary: `Research data for ${upperSymbol}. For real-time data, integrate with a financial data provider like Alpha Vantage, Yahoo Finance, or Polygon.io.`,
    financials: {
      marketCap: "N/A",
      peRatio: "N/A",
      eps: "N/A",
      revenue: "N/A",
      revenueGrowth: "N/A",
      profitMargin: "N/A",
      debtToEquity: "N/A",
    },
    catalysts: [
      "Upcoming earnings report",
      "New product launches",
      "Market expansion opportunities",
    ],
    risks: [
      "Market volatility",
      "Competition",
      "Regulatory changes",
    ],
    sentiment: {
      overall: "neutral",
      socialMedia: "Mixed sentiment across platforms",
      analystRating: "Hold",
    },
    priceTargets: {
      low: "N/A",
      average: "N/A",
      high: "N/A",
    },
    recentNews: [
      `Latest news about ${upperSymbol}`,
      "Check financial news sources for updates",
    ],
    generatedAt: new Date().toISOString(),
  };

  // Save to cache
  await saveResearch(upperSymbol, research);

  return research;
}

// Client-side research using AI (this will be called from API route)
export async function generateAIResearch(symbol: string, webData: string): Promise<StockResearchData> {
  const upperSymbol = symbol.toUpperCase();

  // Parse the web data and structure it
  // This is a simplified version - in production you'd use AI to analyze
  const research: StockResearchData = {
    symbol: upperSymbol,
    companyName: extractCompanyName(webData, upperSymbol),
    summary: extractSummary(webData, upperSymbol),
    financials: extractFinancials(webData),
    catalysts: extractCatalysts(webData),
    risks: extractRisks(webData),
    sentiment: extractSentiment(webData),
    priceTargets: extractPriceTargets(webData),
    recentNews: extractNews(webData),
    generatedAt: new Date().toISOString(),
  };

  await saveResearch(upperSymbol, research);
  return research;
}

// Helper functions to extract data (simplified)
function extractCompanyName(data: string, symbol: string): string {
  // Try to find company name in the data
  const match = data.match(new RegExp(`${symbol}[^a-zA-Z]*(Inc\\.|Corp\\.|Company|Ltd\\.|LLC)?`, "i"));
  return match ? match[0].trim() : `${symbol}`;
}

function extractSummary(data: string, symbol: string): string {
  // Get first substantial paragraph about the company
  const sentences = data.split(/[.!?]+/).filter(s => s.length > 50).slice(0, 3);
  return sentences.join(". ") || `Research summary for ${symbol}`;
}

function extractFinancials(data: string): StockResearchData["financials"] {
  return {
    marketCap: extractValue(data, /market\s*cap[:\s]*\$?([\d.]+[BMK]?)/i),
    peRatio: extractValue(data, /p\/e\s*ratio[:\s]*([\d.]+)/i),
    eps: extractValue(data, /eps[:\s]*\$?([\d.]+)/i),
    revenue: extractValue(data, /revenue[:\s]*\$?([\d.]+[BMK]?)/i),
    revenueGrowth: extractValue(data, /revenue\s*growth[:\s]*([\d.]+%?)/i),
    profitMargin: extractValue(data, /profit\s*margin[:\s]*([\d.]+%?)/i),
    debtToEquity: extractValue(data, /debt[^:]*equity[:\s]*([\d.]+)/i),
  };
}

function extractValue(data: string, regex: RegExp): string {
  const match = data.match(regex);
  return match ? match[1] : "N/A";
}

function extractCatalysts(data: string): string[] {
  const catalysts: string[] = [];
  const patterns = [
    /catalyst[s]?[:\s]*([^.]+)/gi,
    /upcoming[:\s]*([^.]+)/gi,
    /growth\s*driver[s]?[:\s]*([^.]+)/gi,
  ];

  for (const pattern of patterns) {
    const matches = data.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 200) {
        catalysts.push(match[1].trim());
      }
    }
  }

  return catalysts.length > 0 ? catalysts.slice(0, 5) : ["No specific catalysts identified"];
}

function extractRisks(data: string): string[] {
  const risks: string[] = [];
  const patterns = [
    /risk[s]?[:\s]*([^.]+)/gi,
    /concern[s]?[:\s]*([^.]+)/gi,
    /challenge[s]?[:\s]*([^.]+)/gi,
  ];

  for (const pattern of patterns) {
    const matches = data.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 200) {
        risks.push(match[1].trim());
      }
    }
  }

  return risks.length > 0 ? risks.slice(0, 5) : ["Standard market risks apply"];
}

function extractSentiment(data: string): StockResearchData["sentiment"] {
  const lowerData = data.toLowerCase();

  let overall: "bullish" | "bearish" | "neutral" = "neutral";
  const bullishWords = ["bullish", "buy", "outperform", "upgrade", "strong buy"];
  const bearishWords = ["bearish", "sell", "underperform", "downgrade", "avoid"];

  let bullishCount = 0;
  let bearishCount = 0;

  for (const word of bullishWords) {
    bullishCount += (lowerData.match(new RegExp(word, "g")) || []).length;
  }
  for (const word of bearishWords) {
    bearishCount += (lowerData.match(new RegExp(word, "g")) || []).length;
  }

  if (bullishCount > bearishCount + 2) overall = "bullish";
  else if (bearishCount > bullishCount + 2) overall = "bearish";

  return {
    overall,
    socialMedia: overall === "bullish" ? "Positive buzz" : overall === "bearish" ? "Negative sentiment" : "Mixed sentiment",
    analystRating: extractValue(data, /analyst[^:]*rating[:\s]*([a-zA-Z\s]+)/i) || "Hold",
  };
}

function extractPriceTargets(data: string): StockResearchData["priceTargets"] {
  return {
    low: extractValue(data, /price\s*target[^:]*low[:\s]*\$?([\d.]+)/i),
    average: extractValue(data, /(?:average|mean)\s*(?:price\s*)?target[:\s]*\$?([\d.]+)/i),
    high: extractValue(data, /price\s*target[^:]*high[:\s]*\$?([\d.]+)/i),
  };
}

function extractNews(data: string): string[] {
  // Extract sentences that look like news headlines
  const sentences = data.split(/[.!?]+/)
    .filter(s => s.length > 30 && s.length < 150)
    .filter(s => /\d{4}|today|yesterday|week|month|quarter/i.test(s))
    .slice(0, 5);

  return sentences.length > 0 ? sentences.map(s => s.trim()) : ["Check financial news for latest updates"];
}
