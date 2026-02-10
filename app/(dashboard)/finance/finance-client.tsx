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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Finance</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatCurrency(stats.totalValue)}</span>
                  {stats.totalGain !== 0 && (
                    <span className={stats.totalGain >= 0 ? "text-emerald-400" : "text-red-400"}>
                      ({formatPercent(stats.totalGainPercent)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => activeTab === "portfolio" ? setAddHoldingOpen(true) : setAddWatchlistOpen(true)}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
            >
              <p className="text-sm text-emerald-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-emerald-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: "portfolio", label: "Portfolio", icon: PieChart },
              { key: "watchlist", label: "Watchlist", icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTab === key
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800/50 text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === "portfolio" ? (
          <>
            {/* Allocation Chart */}
            {holdings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20"
              >
                <h3 className="text-sm font-medium text-slate-400 mb-3">Allocation</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-8 rounded-full overflow-hidden bg-slate-800 flex">
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
                      <span className="text-slate-500">
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
                  <p className="text-slate-400 text-sm mb-4">
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
                      className={cn(
                        "p-4 rounded-2xl border transition-all",
                        isUp
                          ? "bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20"
                          : "bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-white">
                              {holding.symbol}
                            </span>
                            <button
                              onClick={() => handleResearch(holding.symbol)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors"
                              title="Research"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-400">
                            {holding.shares} shares @ {formatCurrency(holding.avgCost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatCurrency(value)}</p>
                          <p
                            className={cn(
                              "text-sm flex items-center justify-end gap-1",
                              isUp ? "text-emerald-400" : "text-red-400"
                            )}
                          >
                            {isUp ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {formatCurrency(Math.abs(gain))} ({formatPercent(gainPercent)})
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleDeleteHolding(holding.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
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
                <p className="text-slate-400 text-sm mb-4">
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
                  className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-lg text-white">{item.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResearch(item.symbol)}
                        className="border-white/10 text-slate-400 hover:text-white gap-1"
                      >
                        <Search className="w-4 h-4" />
                        Research
                      </Button>
                      <button
                        onClick={() => handleDeleteWatchlistItem(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-slate-400 mt-2">
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
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10 px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Add Position</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddHolding} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-400">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="uppercase bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-400">Shares</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="100"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-400">Avg Cost</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="150.00"
                  value={newAvgCost}
                  onChange={(e) => setNewAvgCost(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-400">
                Current Price (optional)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="155.00"
                value={newCurrentPrice}
                onChange={(e) => setNewCurrentPrice(e.target.value)}
                className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
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
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10 px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Add to Watchlist</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddWatchlistItem} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-400">Symbol</label>
              <Input
                placeholder="e.g., TSLA"
                value={watchlistSymbol}
                onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
                className="uppercase bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
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
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-slate-900 border-white/10 px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Search className="w-5 h-5 text-emerald-400" />
              Research: {researchSymbol}
            </SheetTitle>
          </SheetHeader>

          {researchLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
              <p className="text-slate-400">Analyzing {researchSymbol}...</p>
            </div>
          ) : researchData ? (
            <div className="space-y-6 pb-8">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Summary</h4>
                <p className="text-sm text-slate-400">{researchData.summary}</p>
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
                        : "bg-slate-500/20 text-slate-400"
                    )}
                  >
                    {researchData.sentiment.overall.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-400">
                    {researchData.sentiment.socialMedia}
                  </span>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Key Financials</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(researchData.financials).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 capitalize">
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
                  <div className="flex-1 text-center p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 text-xs">Low</p>
                    <p className="font-semibold text-red-400">{researchData.priceTargets.low}</p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-slate-400 text-xs">Average</p>
                    <p className="font-semibold text-emerald-400">
                      {researchData.priceTargets.average}
                    </p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 text-xs">High</p>
                    <p className="font-semibold text-emerald-400">{researchData.priceTargets.high}</p>
                  </div>
                </div>
              </div>

              {/* Catalysts */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Catalysts</h4>
                <ul className="space-y-2">
                  {researchData.catalysts.map((c, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
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
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
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
                    <li key={i} className="text-sm text-slate-400 bg-slate-800/30 p-2 rounded-lg">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-slate-500 text-center pt-4 border-t border-white/5">
                Generated: {new Date(researchData.generatedAt).toLocaleString()}
                <br />
                For live data, integrate with a financial API
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              No research data available
            </p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
