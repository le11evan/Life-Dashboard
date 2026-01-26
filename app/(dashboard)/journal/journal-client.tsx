"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Calendar,
  Tag,
  Flame,
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
  createJournalEntry,
  deleteJournalEntry,
} from "@/lib/actions/journal";
import { MOOD_OPTIONS } from "@/lib/validations/journal";
import type { JournalEntry } from "@prisma/client";

interface JournalClientProps {
  initialEntries: JournalEntry[];
  streak: number;
  initialSearch: string;
  openAdd?: boolean;
}

export function JournalClient({
  initialEntries,
  streak,
  initialSearch,
  openAdd = false,
}: JournalClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState(initialSearch);
  const [addOpen, setAddOpen] = useState(openAdd);
  const [newContent, setNewContent] = useState("");
  const [newMood, setNewMood] = useState<string | null>(null);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    router.push(value ? `/journal?search=${encodeURIComponent(value)}` : "/journal");
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newTags.includes(tag) && newTags.length < 10) {
      setNewTags([...newTags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setNewTags(newTags.filter((t) => t !== tag));
  }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    startTransition(async () => {
      const entry = await createJournalEntry({
        content: newContent.trim(),
        tags: newTags,
        mood: newMood,
      });
      setEntries((prev) => [entry, ...prev]);
      setNewContent("");
      setNewMood(null);
      setNewTags([]);
      setAddOpen(false);
    });
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    startTransition(async () => {
      await deleteJournalEntry(id);
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
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
            <BookOpen className="w-6 h-6" />
            Journal
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{entries.length} entries</span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                {streak} day streak
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Entry</span>
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {search ? "No entries found" : "Start your journal"}
              </p>
              {!search && (
                <Button
                  variant="link"
                  onClick={() => setAddOpen(true)}
                  className="mt-2"
                >
                  Write your first entry
                </Button>
              )}
            </motion.div>
          ) : (
            entries.map((entry) => {
              const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Card className="p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(entry.createdAt)}</span>
                        <span>·</span>
                        <span>{formatTime(entry.createdAt)}</span>
                        {mood && <span>{mood.emoji}</span>}
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-foreground whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Entry Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
          <SheetHeader className="pb-4">
            <SheetTitle>New Journal Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddEntry} className="flex flex-col h-full pb-8">
            <textarea
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full resize-none border rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />

            <div className="space-y-4 mt-4">
              {/* Mood */}
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">
                  How are you feeling?
                </span>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={newMood === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNewMood(newMood === mood.value ? null : mood.value)
                      }
                    >
                      {mood.emoji} {mood.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">
                  Tags
                </span>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {newTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isPending || !newContent.trim()}
              >
                {isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
