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
import { Chip } from "@/components/ui/chip";
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
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-16 pb-4">
        <div className="t-kicker mb-2">06 · journal</div>
        <div className="flex items-end justify-between">
          <h1 className="t-display text-[44px] text-[var(--fg)]">Journal</h1>
          {streak > 0 ? (
            <Chip tone="yellow">
              <Flame size={10} />
              {streak} day streak
            </Chip>
          ) : (
            <Chip>{entries.length} entries</Chip>
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

      {/* Search + Add */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--fg-mute)" }}
          />
          <Input
            placeholder="search entries..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "var(--line)",
              color: "var(--fg)",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label="Write entry"
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 99,
            background: "linear-gradient(135deg, var(--yellow), var(--orange))",
            color: "#0a0a14",
            border: "none",
            boxShadow: "0 8px 24px -12px rgba(255,214,0,0.6)",
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Entries List */}
      <div className="px-4 pt-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,214,0,0.08)",
                  border: "1px solid rgba(255,214,0,0.2)",
                }}
              >
                <PenLine className="w-7 h-7" style={{ color: "var(--yellow)" }} />
              </div>
              <div className="t-display text-[22px]" style={{ color: "var(--fg-dim)" }}>
                {search ? "No entries found" : "Start your journal"}
              </div>
              <p className="t-mono mt-2 mb-4" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
                {search ? "try a different search" : "capture today's thoughts"}
              </p>
              {!search && (
                <Button
                  onClick={() => setAddOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, var(--yellow), var(--orange))",
                    color: "#0a0a14",
                  }}
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
                  className="tile p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="t-kicker">
                        {formatDate(entry.createdAt)} · {formatTime(entry.createdAt)}
                      </span>
                      {mood && <span className="text-base">{mood.emoji}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditSheet(entry)}
                        style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                        disabled={isPending}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                        disabled={isPending}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p
                    className="whitespace-pre-wrap"
                    style={{
                      color: "var(--fg)",
                      fontSize: 14,
                      lineHeight: 1.55,
                    }}
                  >
                    {entry.content}
                  </p>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <Chip key={tag} tone="yellow">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </Chip>
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
        <SheetContent side="bottom" className="rounded-t-3xl bg-[var(--ink-100)] border-[color:var(--line)] h-[85vh] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">New Journal Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddEntry} className="flex flex-col h-full pb-8">
            <textarea
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full resize-none tile tile--elev rounded-xl p-4 text-white placeholder:text-[color:var(--fg-mute)]/60 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              autoFocus
            />

            <div className="space-y-4 mt-4">
              {/* Mood */}
              <div>
                <span className="text-sm text-[color:var(--fg-mute)] mb-2 block">
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
                          : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
                      )}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-sm text-[color:var(--fg-mute)] mb-2 block">Tags</span>
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
                    className="flex-1 bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="border-[color:var(--line)] text-[color:var(--fg-mute)]"
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
        <SheetContent side="bottom" className="rounded-t-3xl bg-[var(--ink-100)] border-[color:var(--line)] h-[85vh] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">Edit Journal Entry</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditEntry} className="flex flex-col h-full pb-8">
            <textarea
              placeholder="What's on your mind?"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full resize-none tile tile--elev rounded-xl p-4 text-white placeholder:text-[color:var(--fg-mute)]/60 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              autoFocus
            />

            <div className="space-y-4 mt-4">
              {/* Mood */}
              <div>
                <span className="text-sm text-[color:var(--fg-mute)] mb-2 block">
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
                          : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
                      )}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-sm text-[color:var(--fg-mute)] mb-2 block">Tags</span>
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
                    className="flex-1 bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEditTag}
                    className="border-[color:var(--line)] text-[color:var(--fg-mute)]"
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
