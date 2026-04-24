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
import { Chip } from "@/components/ui/chip";
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
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-16 pb-4">
        <div className="t-kicker mb-2">05 · diet</div>
        <div className="flex items-end justify-between">
          <h1 className="t-display text-[44px] text-[var(--fg)]">Diet</h1>
          <span className="t-mono text-[var(--fg-mute)] text-[12px]">
            {activeSupplementCount} supplements
            {latestWeight ? ` · ${latestWeight.weight} lb` : ""}
          </span>
        </div>
      </div>

      {/* Seg + Action */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="seg flex-1 justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`seg__b flex-1 ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "goals" && (
          <button
            type="button"
            onClick={() => setGoalsSheetOpen(true)}
            aria-label="Edit goals"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 32,
              borderRadius: 99,
              background: "linear-gradient(135deg, var(--lime), var(--cyan))",
              color: "#0a0a14",
              border: "none",
              boxShadow: "0 8px 24px -12px rgba(57,255,20,0.5)",
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {activeTab === "supplements" && (
          <button
            type="button"
            onClick={() => {
              resetSupplementForm();
              setSupplementSheetOpen(true);
            }}
            aria-label="Add supplement"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 32,
              borderRadius: 99,
              background: "linear-gradient(135deg, var(--pink), var(--purple))",
              color: "#fff",
              border: "none",
              boxShadow: "0 8px 24px -12px rgba(255,45,120,0.5)",
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {activeTab === "weight" && (
          <button
            type="button"
            onClick={() => setWeightSheetOpen(true)}
            aria-label="Log weight"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 32,
              borderRadius: 99,
              background: "linear-gradient(135deg, var(--cyan), var(--purple))",
              color: "#0a0a14",
              border: "none",
              boxShadow: "0 8px 24px -12px rgba(0,229,255,0.5)",
            }}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="px-4 pt-1">
        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            {/* Quote */}
            {quote && (
              <div className="text-center pb-2">
                <p
                  className="t-display italic"
                  style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: "var(--fg-dim)" }}
                >
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p
                  className="t-mono mt-2"
                  style={{
                    fontSize: 9,
                    color: "var(--fg-mute)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  — {quote.author}
                </p>
              </div>
            )}

            {/* Daily Macro Goals — feature tile */}
            <div className="tile tile--elev edge-lime p-5">
              <div className="t-kicker mb-3">daily macro goals</div>

              {/* Calories - Featured */}
              <div className="flex items-end justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-7 h-7" style={{ color: "var(--orange)" }} />
                  <div>
                    <div className="t-caps">daily calories</div>
                    <div
                      className="t-display glow-lime"
                      style={{ fontSize: 40, color: "var(--lime)" }}
                    >
                      {dietGoals.calories}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hair mb-3" />

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <Beef className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--pink)" }} />
                  <div className="t-mono" style={{ fontSize: 16, color: "var(--fg)" }}>
                    {dietGoals.protein}g
                  </div>
                  <div className="t-caps" style={{ fontSize: 8 }}>protein</div>
                </div>
                <div className="text-center">
                  <Wheat className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--orange)" }} />
                  <div className="t-mono" style={{ fontSize: 16, color: "var(--fg)" }}>
                    {dietGoals.carbs}g
                  </div>
                  <div className="t-caps" style={{ fontSize: 8 }}>carbs</div>
                </div>
                <div className="text-center">
                  <Droplet className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--yellow)" }} />
                  <div className="t-mono" style={{ fontSize: 16, color: "var(--fg)" }}>
                    {dietGoals.fat}g
                  </div>
                  <div className="t-caps" style={{ fontSize: 8 }}>fat</div>
                </div>
              </div>

              {/* Water & Fiber */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" style={{ color: "var(--cyan)" }} />
                    <span className="t-caps">water</span>
                  </div>
                  <span className="t-mono" style={{ fontSize: 13, color: "var(--fg)" }}>
                    {dietGoals.water}oz
                  </span>
                </div>
                <div className="flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}>
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4" style={{ color: "var(--lime)" }} />
                    <span className="t-caps">fiber</span>
                  </div>
                  <span className="t-mono" style={{ fontSize: 13, color: "var(--fg)" }}>
                    {dietGoals.fiber}g
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="tile tile--elev p-4">
                <Pill className="w-5 h-5 mb-2" style={{ color: "var(--purple)" }} />
                <div className="t-display" style={{ fontSize: 28, color: "var(--fg)" }}>
                  {activeSupplementCount}
                </div>
                <div className="t-caps">active supplements</div>
              </div>
              <div className="tile tile--elev p-4">
                <Scale className="w-5 h-5 mb-2" style={{ color: "var(--cyan)" }} />
                <div className="t-display" style={{ fontSize: 28, color: "var(--fg)" }}>
                  {latestWeight?.weight ?? "---"}
                </div>
                <div className="t-caps">current weight (lb)</div>
              </div>
            </div>
          </div>
        )}

        {/* Supplements Tab */}
        {activeTab === "supplements" && (
          <div className="space-y-4">
            {/* Active Supplements */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="t-kicker">active</span>
                <span className="t-mono text-[10px] text-[var(--fg-mute)]">
                  {activeSupplementCount} taken
                </span>
              </div>
              <div className="space-y-2">
                {supplements
                  .filter((s) => s.isActive)
                  .map((supplement) => (
                    <motion.div
                      key={supplement.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="tile p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                              {supplement.name}
                            </span>
                            {supplement.dosage && (
                              <Chip tone="purple">{supplement.dosage}</Chip>
                            )}
                          </div>
                          <div className="t-mono text-[11px] text-[var(--fg-mute)] mt-1">
                            {FREQUENCY_OPTIONS.find((f) => f.value === supplement.frequency)?.label}
                            {supplement.timeOfDay && (
                              <>
                                {" · "}
                                {TIME_OF_DAY_OPTIONS.find((t) => t.value === supplement.timeOfDay)?.label}
                              </>
                            )}
                          </div>
                          {supplement.notes && (
                            <p className="text-[11px] text-[var(--fg-mute)] mt-1 italic">
                              {supplement.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => editSupplement(supplement)}
                            className="p-2"
                            style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSupplement(supplement.id)}
                            className="p-2"
                            style={{ color: "var(--lime)", background: "none", border: "none" }}
                            aria-label="Mark inactive"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {supplements.filter((s) => s.isActive).length === 0 && (
                  <div className="text-center py-8 t-mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                    no active supplements yet
                  </div>
                )}
              </div>
            </div>

            {/* Inactive Supplements */}
            {supplements.filter((s) => !s.isActive).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="t-kicker">inactive</span>
                </div>
                <div className="space-y-2">
                  {supplements
                    .filter((s) => !s.isActive)
                    .map((supplement) => (
                      <motion.div
                        key={supplement.id}
                        layout
                        className="tile p-3 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[13px] font-medium" style={{ color: "var(--fg-mute)" }}>
                              {supplement.name}
                            </span>
                            {supplement.dosage && (
                              <span className="text-[11px] ml-2" style={{ color: "var(--fg-faint)" }}>
                                {supplement.dosage}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSupplement(supplement.id)}
                              className="p-2"
                              style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                              aria-label="Reactivate"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSupplement(supplement.id)}
                              className="p-2"
                              style={{ color: "var(--fg-mute)", background: "none", border: "none" }}
                              aria-label="Delete"
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
                  <span className="text-lg text-[color:var(--fg-mute)] ml-1">lbs</span>
                </div>
                {weightChange !== null && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm pb-1",
                    weightChange > 0 ? "text-red-400" : weightChange < 0 ? "text-green-400" : "text-[color:var(--fg-mute)]"
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
            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-white/[0.03] border border-[color:var(--line)]">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="#8888a0" fontSize={12} />
                      <YAxis stroke="#8888a0" fontSize={12} domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#12121e",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#ffffff" }}
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
                <div className="text-center py-8 text-[color:var(--fg-mute)] text-sm">
                  Log more weights to see your progress chart
                </div>
              )}
            </div>

            {/* Weight History */}
            <div>
              <h3 className="text-sm font-medium text-[color:var(--fg-mute)] mb-3">History</h3>
              <div className="space-y-2">
                {[...weightLogs].reverse().slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">
                        {formatDate(log.date)}
                      </div>
                      {log.notes && (
                        <div className="text-xs text-[color:var(--fg-mute)]/60">{log.notes}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {log.weight} <span className="text-sm text-[color:var(--fg-mute)]">lbs</span>
                    </div>
                  </div>
                ))}
                {weightLogs.length === 0 && (
                  <div className="text-center py-8 text-[color:var(--fg-mute)] text-sm">
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
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">Edit Daily Goals</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Calorie Goal</label>
              <Input
                type="number"
                value={goalsForm.calories}
                onChange={(e) => setGoalsForm({ ...goalsForm, calories: Number(e.target.value) })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Protein (g)</label>
                <Input
                  type="number"
                  value={goalsForm.protein}
                  onChange={(e) => setGoalsForm({ ...goalsForm, protein: Number(e.target.value) })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Carbs (g)</label>
                <Input
                  type="number"
                  value={goalsForm.carbs}
                  onChange={(e) => setGoalsForm({ ...goalsForm, carbs: Number(e.target.value) })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Fat (g)</label>
                <Input
                  type="number"
                  value={goalsForm.fat}
                  onChange={(e) => setGoalsForm({ ...goalsForm, fat: Number(e.target.value) })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Fiber (g)</label>
                <Input
                  type="number"
                  value={goalsForm.fiber}
                  onChange={(e) => setGoalsForm({ ...goalsForm, fiber: Number(e.target.value) })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Water Goal (oz)</label>
              <Input
                type="number"
                step="0.1"
                value={goalsForm.water}
                onChange={(e) => setGoalsForm({ ...goalsForm, water: Number(e.target.value) })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white"
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
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">
              {editingSupplement ? "Edit Supplement" : "Add Supplement"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Name *</label>
              <Input
                placeholder="e.g. Creatine Monohydrate"
                value={supplementForm.name}
                onChange={(e) => setSupplementForm({ ...supplementForm, name: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Dosage</label>
              <Input
                placeholder="e.g. 5g, 1000mg, 2 capsules"
                value={supplementForm.dosage}
                onChange={(e) => setSupplementForm({ ...supplementForm, dosage: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Frequency</label>
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
                        : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Time of Day</label>
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
                        : "bg-white/[0.04] border-[color:var(--line)] text-[color:var(--fg-mute)]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Notes</label>
              <textarea
                placeholder="Any additional notes..."
                value={supplementForm.notes}
                onChange={(e) => setSupplementForm({ ...supplementForm, notes: e.target.value })}
                className="w-full min-h-[80px] resize-none border border-[color:var(--line)] rounded-xl p-3 text-sm bg-white/[0.04] text-white placeholder:text-[color:var(--fg-mute)]/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
        <SheetContent side="bottom" className="rounded-t-3xl h-[50vh] overflow-y-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">Log Weight</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Weight (lbs)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Enter your weight"
                value={weightForm.weight || ""}
                onChange={(e) => setWeightForm({ ...weightForm, weight: Number(e.target.value) })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white text-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Notes (optional)</label>
              <Input
                placeholder="e.g. Morning weigh-in, post-workout"
                value={weightForm.notes}
                onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
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
