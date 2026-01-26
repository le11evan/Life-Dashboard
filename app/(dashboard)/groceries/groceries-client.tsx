"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Square,
  CheckSquare,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import {
  createGroceryItem,
  toggleGroceryItem,
  deleteGroceryItem,
  clearCheckedItems,
} from "@/lib/actions/groceries";
import { GROCERY_CATEGORIES } from "@/lib/validations/grocery";
import type { GroceryItem } from "@prisma/client";

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

  const uncheckedItems = items.filter((i) => !i.isChecked);
  const checkedItems = items.filter((i) => i.isChecked);

  // Group unchecked items by category
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Groceries
          </h1>
          <p className="text-muted-foreground">
            {uncheckedItems.length} items to get
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </motion.div>

      {/* Items List */}
      <div className="space-y-6">
        {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Your shopping list is empty</p>
            <Button
              variant="link"
              onClick={() => setAddOpen(true)}
              className="mt-2"
            >
              Add your first item
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Grouped by category */}
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {category}
                </h3>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <Card className="p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggle(item.id)}
                              disabled={isPending}
                              className="flex-shrink-0"
                            >
                              <motion.div
                                whileTap={{ scale: 0.8 }}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Square className="w-5 h-5" />
                              </motion.div>
                            </button>
                            <span className="flex-1 font-medium">
                              {item.name}
                            </span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              disabled={isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Checked ({checkedItems.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChecked}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-2 opacity-60">
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <Card className="p-3 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggle(item.id)}
                              disabled={isPending}
                              className="flex-shrink-0"
                            >
                              <motion.div
                                whileTap={{ scale: 0.8 }}
                                className="text-primary"
                              >
                                <CheckSquare className="w-5 h-5" />
                              </motion.div>
                            </button>
                            <span className="flex-1 line-through text-muted-foreground">
                              {item.name}
                            </span>
                          </div>
                        </Card>
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
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Item</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddItem} className="space-y-4 pb-8">
            <Input
              placeholder="What do you need?"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-12"
              autoFocus
            />

            <div>
              <span className="text-sm text-muted-foreground mb-2 block">
                Category
              </span>
              <div className="flex flex-wrap gap-2">
                {GROCERY_CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={newCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNewCategory(newCategory === cat ? null : cat)
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
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
