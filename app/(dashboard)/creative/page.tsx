"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Music,
  Pencil,
  Palette,
  Briefcase,
  Smartphone,
  Video,
  MoreHorizontal,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getIdeas,
  getIdeaStats,
  createIdea,
  deleteIdea,
  toggleIdeaPin,
} from "@/lib/actions/creative";
import { IDEA_CATEGORIES } from "@/lib/validations/creative";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";

interface Idea {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Music: Music,
  Writing: Pencil,
  Design: Palette,
  Business: Briefcase,
  "App Ideas": Smartphone,
  Content: Video,
  Other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<string, string> = {
  Music: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
  Writing: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  Design: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
  Business: "from-green-500/20 to-emerald-500/10 border-green-500/30",
  "App Ideas": "from-orange-500/20 to-amber-500/10 border-orange-500/30",
  Content: "from-red-500/20 to-rose-500/10 border-red-500/30",
  Other: "from-slate-500/20 to-gray-500/10 border-slate-500/30",
};

export default function CreativePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState({ total: 0, pinned: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Music");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [ideasData, statsData] = await Promise.all([
      getIdeas(selectedCategory || undefined),
      getIdeaStats(),
    ]);
    setIdeas(ideasData);
    setStats(statsData);
  }, [selectedCategory]);

  useEffect(() => {
    const init = async () => {
      await loadData();
      setQuote(getQuoteForCategory("creative"));
    };
    init();
  }, [loadData]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createIdea({
      title: title.trim(),
      content: content.trim() || undefined,
      category,
      tags,
    });

    setTitle("");
    setContent("");
    setCategory("Music");
    setTags([]);
    setTagInput("");
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteIdea(id);
    loadData();
  };

  const handleTogglePin = async (id: string) => {
    await toggleIdeaPin(id);
    loadData();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const pinnedIdeas = ideas.filter((i) => i.isPinned);
  const unpinnedIdeas = ideas.filter((i) => !i.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Creative Ideas</h1>
                <p className="text-xs text-slate-400">
                  {stats.total} ideas, {stats.pinned} pinned
                </p>
              </div>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Capture Your Idea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="What's your idea?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white"
                  />
                  <Textarea
                    placeholder="Details, notes, inspiration... (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-800 border-white/10 text-white resize-none"
                    rows={4}
                  />
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {IDEA_CATEGORIES.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
                        return (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                              "p-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1",
                              category === cat
                                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                                : "bg-slate-800 border-white/10 text-slate-400"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">
                      Tags ({tags.length}/10)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="outline"
                        size="sm"
                        disabled={!tagInput.trim() || tags.length >= 10}
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                          >
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleCreate}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={!title.trim()}
                  >
                    Save Idea
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
            >
              <p className="text-sm text-yellow-200 italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-yellow-400 mt-1">- {quote.author}</p>
            </motion.div>
          )}

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === null
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-slate-800/50 text-slate-400"
              )}
            >
              All
            </button>
            {IDEA_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                    selectedCategory === cat
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-slate-800/50 text-slate-400"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="px-4 py-4 space-y-6">
        {/* Pinned Ideas */}
        {pinnedIdeas.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Pin className="w-4 h-4 text-yellow-400" />
              Pinned ({pinnedIdeas.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {pinnedIdeas.map((idea, index) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    index={index}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* All Ideas */}
        {unpinnedIdeas.length > 0 && (
          <div>
            {pinnedIdeas.length > 0 && (
              <h2 className="text-sm font-medium text-slate-400 mb-3">
                All Ideas ({unpinnedIdeas.length})
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {unpinnedIdeas.map((idea, index) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    index={index}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {ideas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No ideas yet</h3>
            <p className="text-slate-400 text-sm mb-4">
              Capture your creative sparks and inspirations
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Idea
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  onDelete,
  onTogglePin,
}: {
  idea: Idea;
  index: number;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const Icon = CATEGORY_ICONS[idea.category || "Other"] || MoreHorizontal;
  const colorClass = CATEGORY_COLORS[idea.category || "Other"] || CATEGORY_COLORS.Other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-4 rounded-2xl border bg-gradient-to-br relative group",
        colorClass
      )}
    >
      {/* Pin indicator */}
      {idea.isPinned && (
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-yellow-500">
          <Pin className="w-3 h-3 text-black" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-4 h-4 text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white">{idea.title}</h3>
          {idea.content && (
            <p className="text-sm text-slate-300/80 mt-1 line-clamp-3">{idea.content}</p>
          )}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">
            {new Date(idea.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onTogglePin(idea.id)}
          className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400 hover:text-yellow-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          {idea.isPinned ? (
            <>
              <PinOff className="w-3.5 h-3.5" /> Unpin
            </>
          ) : (
            <>
              <Pin className="w-3.5 h-3.5" /> Pin
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(idea.id)}
          className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </motion.div>
  );
}
