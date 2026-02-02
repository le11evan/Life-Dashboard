"use client";

import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Plus,
  Trash2,
  Target,
  Scale,
  Check,
  Edit2,
  Pill,
  TrendingUp,
  TrendingDown,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Droplets,
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
  updateDietGoals,
  createSupplement,
  updateSupplement,
  toggleSupplementActive,
  deleteSupplement,
  logWeight,
} from "@/lib/actions/diet";
import {
  FREQUENCY_OPTIONS,
  TIME_OF_DAY_OPTIONS,
} from "@/lib/validations/diet";
import { getQuoteForCategory, type Quote } from "@/lib/quotes";
import type { DietGoals, Supplement, WeightLog } from "@prisma/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TabType = "goals" | "supplements" | "weight";

interface DietClientProps {
  dietGoals: DietGoals;
  supplements: Supplement[];
  weightLogs: WeightLog[];
  latestWeight: WeightLog | null;
  openAdd?: boolean;
}

export function DietClient({
  dietGoals: initialDietGoals,
  supplements: initialSupplements,
  weightLogs: initialWeightLogs,
  latestWeight,
  openAdd = false,
}: DietClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("goals");
  const [quote, setQuote] = useState<Quote | null>(null);

  // Goals state
  const [dietGoals, setDietGoals] = useState(initialDietGoals);
  const [goalsSheetOpen, setGoalsSheetOpen] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    calories: initialDietGoals.calories,
    protein: initialDietGoals.protein,
    carbs: initialDietGoals.carbs,
    fat: initialDietGoals.fat,
    fiber: initialDietGoals.fiber,
    water: initialDietGoals.water,
  });

  // Supplements state
  type FrequencyType = "daily" | "twice-daily" | "three-times" | "weekly" | "as-needed";
  type TimeOfDayType = "morning" | "afternoon" | "evening" | "with-meals" | "pre-workout" | "post-workout" | "bedtime" | null;

  const [supplements, setSupplements] = useState(initialSupplements);
  const [supplementSheetOpen, setSupplementSheetOpen] = useState(openAdd);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [supplementForm, setSupplementForm] = useState<{
    name: string;
    dosage: string;
    frequency: FrequencyType;
    timeOfDay: TimeOfDayType;
    notes: string;
    isActive: boolean;
  }>({
    name: "",
    dosage: "",
    frequency: "daily",
    timeOfDay: null,
    notes: "",
    isActive: true,
  });

  // Weight state
  const [weightLogs, setWeightLogs] = useState(initialWeightLogs);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [weightForm, setWeightForm] = useState({
    weight: latestWeight?.weight || 0,
    notes: "",
  });

  useEffect(() => {
    setQuote(getQuoteForCategory("fitness"));
  }, []);

  async function handleSaveGoals() {
    startTransition(async () => {
      const updated = await updateDietGoals(goalsForm);
      setDietGoals(updated);
      setGoalsSheetOpen(false);
    });
  }

  async function handleSaveSupplement() {
    startTransition(async () => {
      if (editingSupplement) {
        const updated = await updateSupplement(editingSupplement.id, supplementForm);
        setSupplements(supplements.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await createSupplement(supplementForm);
        setSupplements([created, ...supplements]);
      }
      resetSupplementForm();
      setSupplementSheetOpen(false);
    });
  }

  async function handleToggleSupplement(id: string) {
    startTransition(async () => {
      const updated = await toggleSupplementActive(id);
      setSupplements(supplements.map((s) => (s.id === updated.id ? updated : s)));
    });
  }

  async function handleDeleteSupplement(id: string) {
    setSupplements(supplements.filter((s) => s.id !== id));
    startTransition(async () => {
      await deleteSupplement(id);
    });
  }

  function resetSupplementForm() {
    setSupplementForm({
      name: "",
      dosage: "",
      frequency: "daily",
      timeOfDay: null,
      notes: "",
      isActive: true,
    });
    setEditingSupplement(null);
  }

  function editSupplement(supplement: Supplement) {
    setEditingSupplement(supplement);
    setSupplementForm({
      name: supplement.name,
      dosage: supplement.dosage || "",
      frequency: supplement.frequency as FrequencyType,
      timeOfDay: supplement.timeOfDay as TimeOfDayType,
      notes: supplement.notes || "",
      isActive: supplement.isActive,
    });
    setSupplementSheetOpen(true);
  }

  async function handleLogWeight() {
    startTransition(async () => {
      const log = await logWeight(weightForm);
      setWeightLogs([...weightLogs.filter((w) => w.id !== log.id), log].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      setWeightSheetOpen(false);
    });
  }

  function formatDate(date: Date) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function getWeightChange() {
    if (weightLogs.length < 2) return null;
    const latest = weightLogs[weightLogs.length - 1];
    const previous = weightLogs[weightLogs.length - 2];
    return latest.weight - previous.weight;
  }

  const weightChange = getWeightChange();
  const activeSupplementCount = supplements.filter((s) => s.isActive).length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "goals", label: "Goals", icon: <Target className="w-4 h-4" /> },
    { id: "supplements", label: "Supplements", icon: <Pill className="w-4 h-4" /> },
    { id: "weight", label: "Weight", icon: <Scale className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500/20 to-green-500/20">
                <Apple className="w-6 h-6 text-lime-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Diet & Nutrition</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{activeSupplementCount} active supplements</span>
                  {latestWeight && (
                    <span className="flex items-center gap-1 text-lime-400">
                      <Scale className="w-3 h-3" />
                      {latestWeight.weight} lbs
                    </span>
                  )}
                </div>
              </div>
            </div>

            {activeTab === "goals" && (
              <Button
                onClick={() => setGoalsSheetOpen(true)}
                size="sm"
                className="bg-lime-500 hover:bg-lime-600 text-black"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {activeTab === "supplements" && (
              <Button
                onClick={() => {
                  resetSupplementForm();
                  setSupplementSheetOpen(true);
                }}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
            {activeTab === "weight" && (
              <Button
                onClick={() => setWeightSheetOpen(true)}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Scale className="w-4 h-4 mr-1" />
                Log
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            {/* Quote */}
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20"
              >
                <p className="text-sm text-lime-200 italic">&ldquo;{quote.text}&rdquo;</p>
                <p className="text-xs text-lime-400 mt-1">- {quote.author}</p>
              </motion.div>
            )}

            {/* Daily Macro Goals */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-lime-500/10 to-green-500/5 border border-lime-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-lime-400" />
                <h3 className="font-semibold text-white">Daily Macro Goals</h3>
              </div>

              {/* Calories - Featured */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Daily Calories</div>
                      <div className="text-2xl font-bold text-white">{dietGoals.calories}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Beef className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{dietGoals.protein}g</div>
                  <div className="text-xs text-slate-400">Protein</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Wheat className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{dietGoals.carbs}g</div>
                  <div className="text-xs text-slate-400">Carbs</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Droplet className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{dietGoals.fat}g</div>
                  <div className="text-xs text-slate-400">Fat</div>
                </div>
              </div>

              {/* Water & Fiber */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-400">Water</span>
                  </div>
                  <span className="text-white font-semibold">{dietGoals.water}oz</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-green-400" />
                    <span className="text-slate-400">Fiber</span>
                  </div>
                  <span className="text-white font-semibold">{dietGoals.fiber}g</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20">
                <Pill className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">{activeSupplementCount}</div>
                <div className="text-sm text-slate-400">Active Supplements</div>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
                <Scale className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{latestWeight?.weight || "---"}</div>
                <div className="text-sm text-slate-400">Current Weight (lbs)</div>
              </div>
            </div>
          </div>
        )}

        {/* Supplements Tab */}
        {activeTab === "supplements" && (
          <div className="space-y-4">
            {/* Active Supplements */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3">Active Supplements ({activeSupplementCount})</h3>
              <div className="space-y-2">
                {supplements
                  .filter((s) => s.isActive)
                  .map((supplement) => (
                    <motion.div
                      key={supplement.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{supplement.name}</span>
                            {supplement.dosage && (
                              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-lg">
                                {supplement.dosage}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            {FREQUENCY_OPTIONS.find((f) => f.value === supplement.frequency)?.label}
                            {supplement.timeOfDay && (
                              <span className="ml-2">
                                • {TIME_OF_DAY_OPTIONS.find((t) => t.value === supplement.timeOfDay)?.label}
                              </span>
                            )}
                          </div>
                          {supplement.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">{supplement.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editSupplement(supplement)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleSupplement(supplement.id)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {supplements.filter((s) => s.isActive).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No active supplements. Add one to track your stack.
                  </div>
                )}
              </div>
            </div>

            {/* Inactive Supplements */}
            {supplements.filter((s) => !s.isActive).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Inactive</h3>
                <div className="space-y-2">
                  {supplements
                    .filter((s) => !s.isActive)
                    .map((supplement) => (
                      <motion.div
                        key={supplement.id}
                        layout
                        className="rounded-xl p-4 bg-slate-800/30 border border-white/5 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-slate-400">{supplement.name}</span>
                            {supplement.dosage && (
                              <span className="text-xs text-slate-500 ml-2">{supplement.dosage}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSupplement(supplement.id)}
                              className="p-2 text-slate-500 hover:text-purple-400 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplement(supplement.id)}
                              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weight Tab */}
        {activeTab === "weight" && (
          <div className="space-y-6">
            {/* Current Weight Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Current Weight</h3>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-white">
                  {latestWeight?.weight || "---"}
                  <span className="text-lg text-slate-400 ml-1">lbs</span>
                </div>
                {weightChange !== null && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm pb-1",
                    weightChange > 0 ? "text-red-400" : weightChange < 0 ? "text-green-400" : "text-slate-400"
                  )}>
                    {weightChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : weightChange < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} lbs
                  </div>
                )}
              </div>
            </div>

            {/* Weight Chart */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Progress (Last 30 Days)</h3>
              {weightLogs.length > 1 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weightLogs.map((w) => ({
                        date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        weight: w.weight,
                      }))}
                    >
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#weightGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Log more weights to see your progress chart
                </div>
              )}
            </div>

            {/* Weight History */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3">History</h3>
              <div className="space-y-2">
                {[...weightLogs].reverse().slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">
                        {formatDate(log.date)}
                      </div>
                      {log.notes && (
                        <div className="text-xs text-slate-500">{log.notes}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {log.weight} <span className="text-sm text-slate-400">lbs</span>
                    </div>
                  </div>
                ))}
                {weightLogs.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No weight logs yet. Start tracking your progress.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goals Sheet */}
      <Sheet open={goalsSheetOpen} onOpenChange={setGoalsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-slate-900 border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Edit Daily Goals</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Calorie Goal</label>
              <Input
                type="number"
                value={goalsForm.calories}
                onChange={(e) => setGoalsForm({ ...goalsForm, calories: Number(e.target.value) })}
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-400">Protein (g)</label>
                <Input
                  type="number"
                  value={goalsForm.protein}
                  onChange={(e) => setGoalsForm({ ...goalsForm, protein: Number(e.target.value) })}
                  className="bg-slate-800 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-400">Carbs (g)</label>
                <Input
                  type="number"
                  value={goalsForm.carbs}
                  onChange={(e) => setGoalsForm({ ...goalsForm, carbs: Number(e.target.value) })}
                  className="bg-slate-800 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-400">Fat (g)</label>
                <Input
                  type="number"
                  value={goalsForm.fat}
                  onChange={(e) => setGoalsForm({ ...goalsForm, fat: Number(e.target.value) })}
                  className="bg-slate-800 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-400">Fiber (g)</label>
                <Input
                  type="number"
                  value={goalsForm.fiber}
                  onChange={(e) => setGoalsForm({ ...goalsForm, fiber: Number(e.target.value) })}
                  className="bg-slate-800 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Water Goal (oz)</label>
              <Input
                type="number"
                step="0.1"
                value={goalsForm.water}
                onChange={(e) => setGoalsForm({ ...goalsForm, water: Number(e.target.value) })}
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <Button
              className="w-full h-12 bg-lime-500 hover:bg-lime-600 text-black font-semibold"
              onClick={handleSaveGoals}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Goals"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Supplement Sheet */}
      <Sheet open={supplementSheetOpen} onOpenChange={(open) => {
        setSupplementSheetOpen(open);
        if (!open) resetSupplementForm();
      }}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-slate-900 border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">
              {editingSupplement ? "Edit Supplement" : "Add Supplement"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Name *</label>
              <Input
                placeholder="e.g. Creatine Monohydrate"
                value={supplementForm.name}
                onChange={(e) => setSupplementForm({ ...supplementForm, name: e.target.value })}
                className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Dosage</label>
              <Input
                placeholder="e.g. 5g, 1000mg, 2 capsules"
                value={supplementForm.dosage}
                onChange={(e) => setSupplementForm({ ...supplementForm, dosage: e.target.value })}
                className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Frequency</label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSupplementForm({ ...supplementForm, frequency: opt.value as FrequencyType })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                      supplementForm.frequency === opt.value
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                        : "bg-slate-800 border-white/10 text-slate-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Time of Day</label>
              <div className="flex flex-wrap gap-2">
                {TIME_OF_DAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSupplementForm({
                      ...supplementForm,
                      timeOfDay: supplementForm.timeOfDay === opt.value ? null : opt.value as TimeOfDayType,
                    })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                      supplementForm.timeOfDay === opt.value
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                        : "bg-slate-800 border-white/10 text-slate-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Notes</label>
              <textarea
                placeholder="Any additional notes..."
                value={supplementForm.notes}
                onChange={(e) => setSupplementForm({ ...supplementForm, notes: e.target.value })}
                className="w-full min-h-[80px] resize-none border border-white/10 rounded-xl p-3 text-sm bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <Button
              className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
              onClick={handleSaveSupplement}
              disabled={isPending || !supplementForm.name.trim()}
            >
              {isPending ? "Saving..." : editingSupplement ? "Update Supplement" : "Add Supplement"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Weight Log Sheet */}
      <Sheet open={weightSheetOpen} onOpenChange={setWeightSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[50vh] overflow-y-auto bg-slate-900 border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Log Weight</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Weight (lbs)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Enter your weight"
                value={weightForm.weight || ""}
                onChange={(e) => setWeightForm({ ...weightForm, weight: Number(e.target.value) })}
                className="bg-slate-800 border-white/10 text-white text-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-400">Notes (optional)</label>
              <Input
                placeholder="e.g. Morning weigh-in, post-workout"
                value={weightForm.notes}
                onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              onClick={handleLogWeight}
              disabled={isPending || !weightForm.weight}
            >
              {isPending ? "Saving..." : "Log Weight"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
