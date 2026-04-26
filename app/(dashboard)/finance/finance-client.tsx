"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  PieChart,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import {
  createHolding,
  deleteHolding,
  createWatchlistItem,
  deleteWatchlistItem,
} from "@/lib/actions/finance";
import { performStockResearch } from "@/lib/actions/research";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";
import type { Holding, WatchlistItem } from "@prisma/client";
import type { StockResearchData } from "@/lib/validations/finance";

interface FinanceClientProps {
  initialHoldings: Holding[];
  initialWatchlist: WatchlistItem[];
  portfolioStats: {
    totalValue: number;
    totalCost: number;
    totalGain: number;
    totalGainPercent: number;
    holdingsCount: number;
  };
}

// Color palette for pie chart
const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export function FinanceClient({
  initialHoldings,
  initialWatchlist,
  portfolioStats: initialStats,
}: FinanceClientProps) {
  const [isPending, startTransition] = useTransition();
  const [holdings, setHoldings] = useState(initialHoldings);
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState<"portfolio" | "watchlist">("portfolio");
  const [quote, setQuote] = useState<Quote | null>(null);

  // Add holding state
  const [addHoldingOpen, setAddHoldingOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newAvgCost, setNewAvgCost] = useState("");
  const [newCurrentPrice, setNewCurrentPrice] = useState("");

  // Add watchlist state
  const [addWatchlistOpen, setAddWatchlistOpen] = useState(false);
  const [watchlistSymbol, setWatchlistSymbol] = useState("");

  // Research state
  const [researchOpen, setResearchOpen] = useState(false);
  const [researchSymbol, setResearchSymbol] = useState("");
  const [researchData, setResearchData] = useState<StockResearchData | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);

  useEffect(() => {
    setQuote(getQuoteForCategory("finance"));
  }, []);

  // Calculate allocation for pie chart
  const allocation = holdings.map((h, i) => {
    const value = (h.currentPrice ?? h.avgCost) * h.shares;
    return {
      symbol: h.symbol,
      value,
      percentage: stats.totalValue > 0 ? (value / stats.totalValue) * 100 : 0,
      color: COLORS[i % COLORS.length],
    };
  });

  async function handleAddHolding(e: React.FormEvent) {
    e.preventDefault();
    if (!newSymbol || !newShares || !newAvgCost) return;

    startTransition(async () => {
      const holding = await createHolding({
        symbol: newSymbol.toUpperCase(),
        shares: parseFloat(newShares),
        avgCost: parseFloat(newAvgCost),
        currentPrice: newCurrentPrice ? parseFloat(newCurrentPrice) : null,
      });
      setHoldings([...holdings, holding]);
      recalculateStats([...holdings, holding]);
      resetHoldingForm();
      setAddHoldingOpen(false);
    });
  }

  function resetHoldingForm() {
    setNewSymbol("");
    setNewShares("");
    setNewAvgCost("");
    setNewCurrentPrice("");
  }

  function recalculateStats(newHoldings: Holding[]) {
    let totalValue = 0;
    let totalCost = 0;
    for (const h of newHoldings) {
      const price = h.currentPrice ?? h.avgCost;
      totalValue += price * h.shares;
      totalCost += h.avgCost * h.shares;
    }
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    setStats({
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      holdingsCount: newHoldings.length,
    });
  }

  async function handleDeleteHolding(id: string) {
    const newHoldings = holdings.filter((h) => h.id !== id);
    setHoldings(newHoldings);
    recalculateStats(newHoldings);
    startTransition(async () => {
      await deleteHolding(id);
    });
  }

  async function handleAddWatchlistItem(e: React.FormEvent) {
    e.preventDefault();
    if (!watchlistSymbol) return;

    startTransition(async () => {
      const item = await createWatchlistItem({
        symbol: watchlistSymbol.toUpperCase(),
      });
      setWatchlist([item, ...watchlist]);
      setWatchlistSymbol("");
      setAddWatchlistOpen(false);
    });
  }

  async function handleDeleteWatchlistItem(id: string) {
    setWatchlist(watchlist.filter((w) => w.id !== id));
    startTransition(async () => {
      await deleteWatchlistItem(id);
    });
  }

  async function handleResearch(symbol: string) {
    setResearchSymbol(symbol);
    setResearchOpen(true);
    setResearchLoading(true);
    setResearchData(null);

    try {
      const data = await performStockResearch(symbol);
      setResearchData(data);
    } catch (error) {
      console.error("Research error:", error);
    } finally {
      setResearchLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value: number) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 md:pt-10">
        <div className="t-kicker mb-2">07 · finance</div>
        <div className="flex items-end justify-between">
          <h1 className="t-display text-[44px] text-[var(--fg)]">Portfolio</h1>
          <Chip tone={stats.totalGain >= 0 ? "lime" : "pink"}>
            {formatPercent(stats.totalGainPercent)}
          </Chip>
        </div>
      </div>

      {/* Feature tile */}
      <div className="px-4 pb-3">
        <div className="tile tile--elev edge-purple p-5">
          <div className="t-kicker mb-2">total value</div>
          <span
            className="t-display glow-purple"
            style={{ fontSize: 44, color: "var(--fg)" }}
          >
            {formatCurrency(stats.totalValue)}
          </span>
          {stats.totalGain !== 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="t-mono"
                style={{
                  fontSize: 12,
                  color: stats.totalGain >= 0 ? "var(--lime)" : "var(--pink)",
                }}
              >
                {stats.totalGain >= 0 ? "+" : ""}
                {formatCurrency(stats.totalGain)}
              </span>
              <span className="t-mono text-[10px] text-[var(--fg-mute)]">
                all time
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quote */}
      {quote && (
        <div className="px-4 pb-3 text-center">
          <p
            className="t-display italic"
            style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: "var(--fg-dim)" }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            className="t-mono mt-2"
            style={{ fontSize: 9, color: "var(--fg-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            — {quote.author}
          </p>
        </div>
      )}

      {/* Seg + Add */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="seg flex-1 justify-between">
          {[
            { key: "portfolio", label: "portfolio" },
            { key: "watchlist", label: "watchlist" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`seg__b flex-1 ${activeTab === key ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            activeTab === "portfolio" ? setAddHoldingOpen(true) : setAddWatchlistOpen(true)
          }
          aria-label="Add"
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 32,
            borderRadius: 99,
            background: "linear-gradient(135deg, var(--purple), var(--cyan))",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 24px -12px rgba(157,78,221,0.5)",
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-1 space-y-4">
        {activeTab === "portfolio" ? (
          <>
            {/* Allocation Chart */}
            {holdings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20"
              >
                <h3 className="text-sm font-medium text-[color:var(--fg-mute)] mb-3">Allocation</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-8 rounded-full overflow-hidden bg-white/[0.04] flex">
                    {allocation.map((a) => (
                      <div
                        key={a.symbol}
                        className="h-full transition-all"
                        style={{
                          width: `${a.percentage}%`,
                          backgroundColor: a.color,
                        }}
                        title={`${a.symbol}: ${a.percentage.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {allocation.map((a) => (
                    <div key={a.symbol} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: a.color }}
                      />
                      <span className="font-medium text-white">{a.symbol}</span>
                      <span className="text-[color:var(--fg-mute)]/60">
                        {a.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Holdings List */}
            <AnimatePresence mode="popLayout">
              {holdings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <PieChart className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No positions yet</h3>
                  <p className="text-[color:var(--fg-mute)] text-sm mb-4">
                    Track your investment portfolio
                  </p>
                  <Button
                    onClick={() => setAddHoldingOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Position
                  </Button>
                </motion.div>
              ) : (
                holdings.map((holding, index) => {
                  const currentPrice = holding.currentPrice ?? holding.avgCost;
                  const value = currentPrice * holding.shares;
                  const cost = holding.avgCost * holding.shares;
                  const gain = value - cost;
                  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
                  const isUp = gain >= 0;

                  return (
                    <motion.div
                      key={holding.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      className="tile p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--line-soft)",
                            }}
                          >
                            <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-dim)", fontWeight: 700 }}>
                              {holding.symbol.slice(0, 4)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
                                {holding.symbol}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResearch(holding.symbol)}
                                style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                                aria-label="Research"
                              >
                                <Search className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="t-mono text-[10px] text-[var(--fg-mute)] mt-0.5">
                              {holding.shares} shares · {formatCurrency(holding.avgCost)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="t-mono" style={{ fontSize: 14, color: "var(--fg)" }}>
                            {formatCurrency(value)}
                          </p>
                          <p
                            className="t-mono flex items-center justify-end gap-1"
                            style={{
                              fontSize: 10,
                              color: isUp ? "var(--lime)" : "var(--pink)",
                            }}
                          >
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercent(gainPercent)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding(holding.id)}
                          style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                          disabled={isPending}
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Watchlist Tab */
          <AnimatePresence mode="popLayout">
            {watchlist.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
                <p className="text-[color:var(--fg-mute)] text-sm mb-4">
                  Add stocks to track
                </p>
                <Button
                  onClick={() => setAddWatchlistOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              </motion.div>
            ) : (
              watchlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="tile p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5" style={{ color: "var(--yellow)" }} />
                      <span className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
                        {item.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleResearch(item.symbol)}
                        className="flex items-center gap-1 px-2.5 py-1.5"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          color: "var(--fg-dim)",
                        }}
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span className="t-mono" style={{ fontSize: 10, textTransform: "uppercase" }}>
                          Research
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWatchlistItem(item.id)}
                        className="p-2"
                        style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                        disabled={isPending}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-[color:var(--fg-mute)] mt-2">
                      {item.notes}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Holding Sheet */}
      <Sheet open={addHoldingOpen} onOpenChange={setAddHoldingOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">Add Position</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddHolding} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block text-[color:var(--fg-mute)]">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="uppercase bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-[color:var(--fg-mute)]">Shares</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="100"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-[color:var(--fg-mute)]">Avg Cost</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="150.00"
                  value={newAvgCost}
                  onChange={(e) => setNewAvgCost(e.target.value)}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-[color:var(--fg-mute)]">
                Current Price (optional)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="155.00"
                value={newCurrentPrice}
                onChange={(e) => setNewCurrentPrice(e.target.value)}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              disabled={isPending || !newSymbol || !newShares || !newAvgCost}
            >
              {isPending ? "Adding..." : "Add Position"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Watchlist Sheet */}
      <Sheet open={addWatchlistOpen} onOpenChange={setAddWatchlistOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">Add to Watchlist</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddWatchlistItem} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block text-[color:var(--fg-mute)]">Symbol</label>
              <Input
                placeholder="e.g., TSLA"
                value={watchlistSymbol}
                onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
                className="uppercase bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              disabled={isPending || !watchlistSymbol}
            >
              {isPending ? "Adding..." : "Add to Watchlist"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Research Sheet */}
      <Sheet open={researchOpen} onOpenChange={setResearchOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Search className="w-5 h-5 text-emerald-400" />
              Research: {researchSymbol}
            </SheetTitle>
          </SheetHeader>

          {researchLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
              <p className="text-[color:var(--fg-mute)]">Analyzing {researchSymbol}...</p>
            </div>
          ) : researchData ? (
            <div className="space-y-6 pb-8">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Summary</h4>
                <p className="text-sm text-[color:var(--fg-mute)]">{researchData.summary}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Sentiment</h4>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      researchData.sentiment.overall === "bullish"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : researchData.sentiment.overall === "bearish"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/[0.05] text-[color:var(--fg-mute)]"
                    )}
                  >
                    {researchData.sentiment.overall.toUpperCase()}
                  </span>
                  <span className="text-sm text-[color:var(--fg-mute)]">
                    {researchData.sentiment.socialMedia}
                  </span>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Key Financials</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(researchData.financials).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 px-3 bg-white/[0.03] rounded-lg">
                      <span className="text-[color:var(--fg-mute)] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Targets */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Price Targets</h4>
                <div className="flex gap-3 text-sm">
                  <div className="flex-1 text-center p-3 bg-white/[0.03] rounded-xl">
                    <p className="text-[color:var(--fg-mute)] text-xs">Low</p>
                    <p className="font-semibold text-red-400">{researchData.priceTargets.low}</p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-[color:var(--fg-mute)] text-xs">Average</p>
                    <p className="font-semibold text-emerald-400">
                      {researchData.priceTargets.average}
                    </p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-white/[0.03] rounded-xl">
                    <p className="text-[color:var(--fg-mute)] text-xs">High</p>
                    <p className="font-semibold text-emerald-400">{researchData.priceTargets.high}</p>
                  </div>
                </div>
              </div>

              {/* Catalysts */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Catalysts</h4>
                <ul className="space-y-2">
                  {researchData.catalysts.map((c, i) => (
                    <li key={i} className="text-sm text-[color:var(--fg-mute)] flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Risks</h4>
                <ul className="space-y-2">
                  {researchData.risks.map((r, i) => (
                    <li key={i} className="text-sm text-[color:var(--fg-mute)] flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent News */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Recent News</h4>
                <ul className="space-y-2">
                  {researchData.recentNews.map((n, i) => (
                    <li key={i} className="text-sm text-[color:var(--fg-mute)] bg-white/[0.03] p-2 rounded-lg">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-[color:var(--fg-mute)]/60 text-center pt-4 border-t border-[color:var(--line-soft)]">
                Generated: {new Date(researchData.generatedAt).toLocaleString()}
                <br />
                For live data, integrate with a financial API
              </p>
            </div>
          ) : (
            <p className="text-[color:var(--fg-mute)] text-center py-8">
              No research data available
            </p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
