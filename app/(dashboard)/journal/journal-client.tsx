"use client";

import { useState, useTransition, useEffect } from "react";
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
  PenLine,
  Pencil,
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
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/lib/actions/journal";
import { MOOD_OPTIONS } from "@/lib/validations/journal";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";
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
  const [quote, setQuote] = useState<Quote | null>(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");

  useEffect(() => {
    setQuote(getQuoteForCategory("journal"));
  }, []);

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

  function openEditSheet(entry: JournalEntry) {
    setEditingEntry(entry);
    setEditContent(entry.content);
    setEditMood(entry.mood);
    setEditTags(entry.tags);
    setEditTagInput("");
    setEditOpen(true);
  }

  function addEditTag() {
    const tag = editTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag) && editTags.length < 10) {
      setEditTags([...editTags, tag]);
      setEditTagInput("");
    }
  }

  function removeEditTag(tag: string) {
    setEditTags(editTags.filter((t) => t !== tag));
  }

  async function handleEditEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntry || !editContent.trim()) return;

    const updatedEntry = {
      ...editingEntry,
      content: editContent.trim(),
      mood: editMood,
      tags: editTags,
    };

    setEntries((prev) =>
      prev.map((entry) => (entry.id === editingEntry.id ? updatedEntry : entry))
    );
    setEditOpen(false);

    startTransition(async () => {
      await updateJournalEntry({
        id: editingEntry.id,
        content: editContent.trim(),
        mood: editMood,
        tags: editTags,
      });
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Journal</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{entries.length} entries</span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-3 h-3" />
                      {streak} day streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              Write
            </Button>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <p className="text-sm text-amber-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-amber-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="px-4 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <PenLine className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {search ? "No entries found" : "Start your journal"}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {search ? "Try a different search term" : "Capture your thoughts and reflections"}
              </p>
              {!search && (
                <Button
                  onClick={() => setAddOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Entry
                </Button>
              )}
            </motion.div>
          ) : (
            entries.map((entry, index) => {
              const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(entry.createdAt)}</span>
                      <span className="text-slate-600">·</span>
                      <span>{formatTime(entry.createdAt)}</span>
                      {mood && (
                        <span className="ml-1 text-base">{mood.emoji}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditSheet(entry)}
                        className="text-slate-500 hover:text-amber-400 transition-colors"
                        disabled={isPending}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-300"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Entry Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10 h-[85vh] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">New Journal Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddEntry} className="flex flex-col h-full pb-8">
            <textarea
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full resize-none bg-slate-800 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              autoFocus
            />

            <div className="space-y-4 mt-4">
              {/* Mood */}
              <div>
                <span className="text-sm text-slate-400 mb-2 block">
                  How are you feeling?
                </span>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setNewMood(newMood === mood.value ? null : mood.value)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                        newMood === mood.value
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                          : "bg-slate-800 border-white/10 text-slate-400"
                      )}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-sm text-slate-400 mb-2 block">Tags</span>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-300"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                    className="flex-1 bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="border-white/10 text-slate-400"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                disabled={isPending || !newContent.trim()}
              >
                {isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Entry Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-slate-900 border-white/10 h-[85vh] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Edit Journal Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditEntry} className="flex flex-col h-full pb-8">
            <textarea
              placeholder="What's on your mind?"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full resize-none bg-slate-800 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              autoFocus
            />

            <div className="space-y-4 mt-4">
              {/* Mood */}
              <div>
                <span className="text-sm text-slate-400 mb-2 block">
                  How are you feeling?
                </span>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setEditMood(editMood === mood.value ? null : mood.value)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                        editMood === mood.value
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                          : "bg-slate-800 border-white/10 text-slate-400"
                      )}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-sm text-slate-400 mb-2 block">Tags</span>
                {editTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-300"
                      >
                        {tag}
                        <button type="button" onClick={() => removeEditTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditTag();
                      }
                    }}
                    className="flex-1 bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEditTag}
                    className="border-white/10 text-slate-400"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                disabled={isPending || !editContent.trim()}
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
