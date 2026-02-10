"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Square,
  CheckSquare,
  Trash2,
  X,
  ShoppingBag,
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
  createGroceryItem,
  toggleGroceryItem,
  deleteGroceryItem,
  clearCheckedItems,
} from "@/lib/actions/groceries";
import { GROCERY_CATEGORIES } from "@/lib/validations/grocery";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";
import type { GroceryItem } from "@prisma/client";

const categoryColors: Record<string, string> = {
  Produce: "from-green-500/20 to-emerald-500/10 border-green-500/30",
  Protein: "from-red-500/20 to-rose-500/10 border-red-500/30",
  Dairy: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  Grains: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
  Bakery: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
  Frozen: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
  Pantry: "from-orange-500/20 to-amber-500/10 border-orange-500/30",
  Beverages: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
  Snacks: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
  Fruits: "from-orange-500/20 to-yellow-500/10 border-orange-500/30",
  Vegetables: "from-lime-500/20 to-green-500/10 border-lime-500/30",
  Household: "from-slate-500/20 to-gray-500/10 border-slate-500/30",
  "Personal Care": "from-violet-500/20 to-purple-500/10 border-violet-500/30",
  Pet: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
  Health: "from-teal-500/20 to-emerald-500/10 border-teal-500/30",
  Other: "from-slate-500/20 to-gray-500/10 border-slate-500/30",
};

interface GroceriesClientProps {
  initialItems: GroceryItem[];
  openAdd?: boolean;
}

export function GroceriesClient({
  initialItems,
  openAdd = false,
}: GroceriesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [addOpen, setAddOpen] = useState(openAdd);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getQuoteForCategory("general"));
  }, []);

  const uncheckedItems = items.filter((i) => !i.isChecked);
  const checkedItems = items.filter((i) => i.isChecked);

  const groupedItems = uncheckedItems.reduce(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    startTransition(async () => {
      const item = await createGroceryItem({
        name: newName.trim(),
        category: newCategory,
      });
      setItems((prev) => [item, ...prev]);
      setNewName("");
      setNewCategory(null);
      setAddOpen(false);
    });
  }

  async function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isChecked: !i.isChecked } : i))
    );

    startTransition(async () => {
      await toggleGroceryItem(id);
    });
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await deleteGroceryItem(id);
    });
  }

  async function handleClearChecked() {
    setItems((prev) => prev.filter((i) => !i.isChecked));
    startTransition(async () => {
      await clearCheckedItems();
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Groceries</h1>
                <p className="text-xs text-slate-400">
                  {uncheckedItems.length} items to get
                </p>
              </div>
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <p className="text-sm text-green-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-green-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="px-4 py-4 space-y-6">
        {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">List is empty</h3>
            <p className="text-slate-400 text-sm mb-4">
              Add items to your shopping list
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Grouped by category */}
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-slate-400 mb-3 px-1">
                  {category} ({categoryItems.length})
                </h3>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {categoryItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "p-4 rounded-2xl border bg-gradient-to-br transition-all",
                          categoryColors[category] || categoryColors.Other
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggle(item.id)}
                            disabled={isPending}
                            className="flex-shrink-0"
                          >
                            <motion.div whileTap={{ scale: 0.8 }}>
                              <Square className="w-5 h-5 text-green-400 hover:text-green-300" />
                            </motion.div>
                          </button>
                          <span className="flex-1 font-medium text-white">
                            {item.name}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            disabled={isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-medium text-slate-400">
                    Checked ({checkedItems.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChecked}
                    className="h-7 text-xs text-slate-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-slate-800/30 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggle(item.id)}
                            disabled={isPending}
                            className="flex-shrink-0"
                          >
                            <motion.div whileTap={{ scale: 0.8 }}>
                              <CheckSquare className="w-5 h-5 text-green-500" />
                            </motion.div>
                          </button>
                          <span className="flex-1 line-through text-slate-500">
                            {item.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Item Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10 px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Add Item</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddItem} className="space-y-4 pb-8">
            <Input
              placeholder="What do you need?"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
              autoFocus
            />

            <div>
              <span className="text-sm text-slate-400 mb-2 block">Category</span>
              <div className="flex flex-wrap gap-2">
                {GROCERY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(newCategory === cat ? null : cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                      newCategory === cat
                        ? "bg-green-500/20 border-green-500/50 text-green-400"
                        : "bg-slate-800 border-white/10 text-slate-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-500 hover:bg-green-600"
              disabled={isPending || !newName.trim()}
            >
              {isPending ? "Adding..." : "Add Item"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
