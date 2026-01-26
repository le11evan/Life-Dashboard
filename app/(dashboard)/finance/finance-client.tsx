"use client";

import { useState, useTransition } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import {
  createHolding,
  deleteHolding,
  createWatchlistItem,
  deleteWatchlistItem,
} from "@/lib/actions/finance";
import { performStockResearch } from "@/lib/actions/research";
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
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
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
  const [activeTab, setActiveTab] = useState("portfolio");

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Finance
        </h1>
        <p className="text-muted-foreground">
          Portfolio value: {formatCurrency(stats.totalValue)}
          {stats.totalGain !== 0 && (
            <span
              className={`ml-2 ${
                stats.totalGain >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ({formatPercent(stats.totalGainPercent)})
            </span>
          )}
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="portfolio" className="flex-1">
            <PieChart className="w-4 h-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex-1">
            <Star className="w-4 h-4 mr-2" />
            Watchlist
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          {/* Allocation Chart */}
          {holdings.length > 0 && (
            <Card className="p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-3">Allocation</h3>
              <div className="flex items-center gap-4">
                {/* Simple bar chart */}
                <div className="flex-1 h-8 rounded-full overflow-hidden bg-muted flex">
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
                    <span className="font-medium">{a.symbol}</span>
                    <span className="text-muted-foreground">
                      {a.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Holdings List */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Holdings ({holdings.length})</h3>
            <Button
              size="sm"
              onClick={() => setAddHoldingOpen(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {holdings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PieChart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No positions yet</p>
                <Button
                  variant="link"
                  onClick={() => setAddHoldingOpen(true)}
                  className="mt-2"
                >
                  Add your first position
                </Button>
              </motion.div>
            ) : (
              holdings.map((holding) => {
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
                  >
                    <Card className="p-4 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              {holding.symbol}
                            </span>
                            <button
                              onClick={() => handleResearch(holding.symbol)}
                              className="text-muted-foreground hover:text-primary"
                              title="Research"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {holding.shares} shares @ {formatCurrency(holding.avgCost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(value)}</p>
                          <p
                            className={`text-sm flex items-center justify-end gap-1 ${
                              isUp ? "text-green-500" : "text-red-500"
                            }`}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHolding(holding.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Watchlist ({watchlist.length})</h3>
            <Button
              size="sm"
              onClick={() => setAddWatchlistOpen(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {watchlist.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Your watchlist is empty</p>
                <Button
                  variant="link"
                  onClick={() => setAddWatchlistOpen(true)}
                  className="mt-2"
                >
                  Add a stock to watch
                </Button>
              </motion.div>
            ) : (
              watchlist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-lg">{item.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResearch(item.symbol)}
                          className="gap-1"
                        >
                          <Search className="w-4 h-4" />
                          Research
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWatchlistItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.notes}
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Add Holding Sheet */}
      <Sheet open={addHoldingOpen} onOpenChange={setAddHoldingOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Position</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddHolding} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="uppercase"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Shares</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="100"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Avg Cost</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="150.00"
                  value={newAvgCost}
                  onChange={(e) => setNewAvgCost(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Current Price (optional)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="155.00"
                value={newCurrentPrice}
                onChange={(e) => setNewCurrentPrice(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isPending || !newSymbol || !newShares || !newAvgCost}
            >
              {isPending ? "Adding..." : "Add Position"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Watchlist Sheet */}
      <Sheet open={addWatchlistOpen} onOpenChange={setAddWatchlistOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Add to Watchlist</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddWatchlistItem} className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-1 block">Symbol</label>
              <Input
                placeholder="e.g., TSLA"
                value={watchlistSymbol}
                onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
                className="uppercase"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isPending || !watchlistSymbol}
            >
              {isPending ? "Adding..." : "Add to Watchlist"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Research Sheet */}
      <Sheet open={researchOpen} onOpenChange={setResearchOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Research: {researchSymbol}
            </SheetTitle>
          </SheetHeader>

          {researchLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing {researchSymbol}...</p>
            </div>
          ) : researchData ? (
            <div className="space-y-6 pb-8">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{researchData.summary}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="font-semibold mb-2">Sentiment</h4>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      researchData.sentiment.overall === "bullish"
                        ? "bg-green-100 text-green-700"
                        : researchData.sentiment.overall === "bearish"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {researchData.sentiment.overall.toUpperCase()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {researchData.sentiment.socialMedia}
                  </span>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h4 className="font-semibold mb-2">Key Financials</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(researchData.financials).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Targets */}
              <div>
                <h4 className="font-semibold mb-2">Price Targets</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex-1 text-center p-2 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Low</p>
                    <p className="font-semibold">{researchData.priceTargets.low}</p>
                  </div>
                  <div className="flex-1 text-center p-2 bg-primary/10 rounded-lg">
                    <p className="text-muted-foreground">Average</p>
                    <p className="font-semibold text-primary">
                      {researchData.priceTargets.average}
                    </p>
                  </div>
                  <div className="flex-1 text-center p-2 bg-muted rounded-lg">
                    <p className="text-muted-foreground">High</p>
                    <p className="font-semibold">{researchData.priceTargets.high}</p>
                  </div>
                </div>
              </div>

              {/* Catalysts */}
              <div>
                <h4 className="font-semibold mb-2">Catalysts</h4>
                <ul className="space-y-1">
                  {researchData.catalysts.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h4 className="font-semibold mb-2">Risks</h4>
                <ul className="space-y-1">
                  {researchData.risks.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent News */}
              <div>
                <h4 className="font-semibold mb-2">Recent News</h4>
                <ul className="space-y-2">
                  {researchData.recentNews.map((n, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {n}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                Generated: {new Date(researchData.generatedAt).toLocaleString()}
                <br />
                For live data, integrate with a financial API
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No research data available
            </p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
