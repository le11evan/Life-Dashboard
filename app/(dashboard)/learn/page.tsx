"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Globe,
  TrendingUp,
  Heart,
  Microscope,
  Trophy,
  Film,
  Cpu,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDailyNews } from "@/lib/actions/news";
import { NEWS_CATEGORIES, type NewsArticle } from "@/lib/types/news";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Politics: Globe,
  Technology: Cpu,
  Finance: TrendingUp,
  Health: Heart,
  Science: Microscope,
  Sports: Trophy,
  Entertainment: Film,
};

const CATEGORY_COLORS: Record<string, string> = {
  Politics: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
  Technology: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
  Finance: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
  Health: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
  Science: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
  Sports: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
  Entertainment: "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400",
};

export default function LearnPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  const loadNews = async () => {
    setIsLoading(true);
    const data = await getDailyNews();
    setArticles(data.articles);
    setIsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadNews();
      setQuote(getQuoteForCategory("learn"));
    };
    init();
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  const categoryCounts = NEWS_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Newspaper className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Daily News</h1>
                <p className="text-xs text-slate-400">
                  {articles.length} articles today
                </p>
              </div>
            </div>

            <button
              onClick={loadNews}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <RefreshCw
                className={cn(
                  "w-5 h-5 text-slate-400",
                  isLoading && "animate-spin"
                )}
              />
            </button>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
            >
              <p className="text-sm text-cyan-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-cyan-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === null
                  ? "bg-white/10 text-white"
                  : "bg-slate-800/50 text-slate-400"
              )}
            >
              All
            </button>
            {NEWS_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category] || Globe;
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                    selectedCategory === category
                      ? "bg-white/10 text-white"
                      : "bg-slate-800/50 text-slate-400"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category}
                  {count > 0 && (
                    <span className="text-xs opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-800/30 border border-white/5 animate-pulse"
              >
                <div className="h-4 w-20 bg-slate-700 rounded mb-3" />
                <div className="h-5 w-3/4 bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No articles found</h3>
            <p className="text-slate-400 text-sm">
              {selectedCategory
                ? `No ${selectedCategory} news available today`
                : "Check back later for updates"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => {
              const Icon = CATEGORY_ICONS[article.category] || Globe;
              const colorClass = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.Politics;

              return (
                <motion.div
                  key={`${article.category}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-2xl border bg-gradient-to-br",
                    colorClass
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{article.category}</span>
                    {article.source && (
                      <span className="text-xs opacity-60">• {article.source}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-white mb-2">{article.title}</h3>
                  <p className="text-sm text-slate-300 opacity-80">{article.summary}</p>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Read more <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Category Overview Cards */}
        {!selectedCategory && articles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-slate-400 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {NEWS_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category] || Globe;
                const count = categoryCounts[category] || 0;
                const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.Politics;

                return (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-4 rounded-xl border bg-gradient-to-br text-left transition-all",
                      colorClass
                    )}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <h3 className="font-medium text-white">{category}</h3>
                    <p className="text-xs opacity-60 mt-1">
                      {count} {count === 1 ? "article" : "articles"}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
