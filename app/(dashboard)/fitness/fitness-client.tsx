"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
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
import {
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  addExercise,
  updateExercise,
  deleteExercise,
  logExercise,
} from "@/lib/actions/fitness";
import type { WorkoutTemplate, TemplateExercise, ExerciseLog } from "@prisma/client";

type TemplateWithExercises = WorkoutTemplate & {
  exercises: (TemplateExercise & { logs: ExerciseLog[] })[];
};

interface FitnessClientProps {
  templates: TemplateWithExercises[];
  openAdd?: boolean;
  selectedTemplateId?: string;
}

export function FitnessClient({
  templates: initialTemplates,
  openAdd = false,
  selectedTemplateId,
}: FitnessClientProps) {
  const [isPending, startTransition] = useTransition();
  const [templates, setTemplates] = useState(initialTemplates);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(
    new Set(selectedTemplateId ? [selectedTemplateId] : [])
  );

  // Template sheet state
  const [templateSheetOpen, setTemplateSheetOpen] = useState(openAdd);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");

  // Exercise sheet state
  const [exerciseSheetOpen, setExerciseSheetOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<TemplateExercise | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    sets: "2 Working Sets",
    repRange: "8-12",
    notes: "",
  });

  // Log sheet state
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [loggingExercise, setLoggingExercise] = useState<(TemplateExercise & { logs: ExerciseLog[] }) | null>(null);
  const [logForm, setLogForm] = useState({
    weight: "",
    reps: "",
    reps2: "", // For second set
  });

  function toggleTemplate(id: string) {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTemplates(newExpanded);
  }

  // ============ TEMPLATE HANDLERS ============

  function openNewTemplate() {
    setEditingTemplate(null);
    setTemplateName("");
    setTemplateSheetOpen(true);
  }

  function openEditTemplate(template: WorkoutTemplate) {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSheetOpen(true);
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;

    startTransition(async () => {
      if (editingTemplate) {
        const updated = await updateWorkoutTemplate(editingTemplate.id, templateName);
        setTemplates(
          templates.map((t) =>
            t.id === updated.id ? { ...t, name: updated.name } : t
          )
        );
      } else {
        const created = await createWorkoutTemplate(templateName);
        setTemplates([...templates, { ...created, exercises: [] }]);
        setExpandedTemplates(new Set([...expandedTemplates, created.id]));
      }
      setTemplateSheetOpen(false);
      setTemplateName("");
      setEditingTemplate(null);
    });
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm("Delete this workout template? All exercises and logs will be lost.")) return;

    setTemplates(templates.filter((t) => t.id !== id));
    startTransition(async () => {
      await deleteWorkoutTemplate(id);
    });
  }

  // ============ EXERCISE HANDLERS ============

  function openNewExercise(templateId: string) {
    setEditingExercise(null);
    setCurrentTemplateId(templateId);
    setExerciseForm({
      name: "",
      sets: "2 Working Sets",
      repRange: "8-12",
      notes: "",
    });
    setExerciseSheetOpen(true);
  }

  function openEditExercise(exercise: TemplateExercise) {
    setEditingExercise(exercise);
    setCurrentTemplateId(exercise.templateId);
    setExerciseForm({
      name: exercise.name,
      sets: exercise.sets,
      repRange: exercise.repRange,
      notes: exercise.notes || "",
    });
    setExerciseSheetOpen(true);
  }

  async function handleSaveExercise() {
    if (!exerciseForm.name.trim() || !currentTemplateId) return;

    startTransition(async () => {
      if (editingExercise) {
        const updated = await updateExercise(editingExercise.id, exerciseForm);
        setTemplates(
          templates.map((t) => ({
            ...t,
            exercises: t.exercises.map((e) =>
              e.id === updated.id ? { ...e, ...updated } : e
            ),
          }))
        );
      } else {
        const created = await addExercise(currentTemplateId, exerciseForm);
        setTemplates(
          templates.map((t) =>
            t.id === currentTemplateId
              ? { ...t, exercises: [...t.exercises, { ...created, logs: [] }] }
              : t
          )
        );
      }
      setExerciseSheetOpen(false);
      setExerciseForm({ name: "", sets: "2 Working Sets", repRange: "8-12", notes: "" });
      setEditingExercise(null);
      setCurrentTemplateId(null);
    });
  }

  async function handleDeleteExercise(id: string) {
    if (!confirm("Delete this exercise? All logs will be lost.")) return;

    setTemplates(
      templates.map((t) => ({
        ...t,
        exercises: t.exercises.filter((e) => e.id !== id),
      }))
    );
    startTransition(async () => {
      await deleteExercise(id);
    });
    setExerciseSheetOpen(false);
  }

  // ============ LOG HANDLERS ============

  function openLogExercise(exercise: TemplateExercise & { logs: ExerciseLog[] }) {
    setLoggingExercise(exercise);
    setLogForm({ weight: "", reps: "", reps2: "" });
    setLogSheetOpen(true);
  }

  async function handleSaveLog() {
    if (!loggingExercise || !logForm.weight || !logForm.reps) return;

    const entries = [{ weight: Number(logForm.weight), reps: Number(logForm.reps) }];
    if (logForm.reps2) {
      entries.push({ weight: Number(logForm.weight), reps: Number(logForm.reps2) });
    }

    startTransition(async () => {
      const log = await logExercise(loggingExercise.id, new Date(), entries);
      setTemplates(
        templates.map((t) => ({
          ...t,
          exercises: t.exercises.map((e) =>
            e.id === loggingExercise.id
              ? { ...e, logs: [log, ...e.logs.filter((l) => l.id !== log.id)] }
              : e
          ),
        }))
      );
      setLogSheetOpen(false);
      setLogForm({ weight: "", reps: "", reps2: "" });
      setLoggingExercise(null);
    });
  }

  // ============ FORMAT HELPERS ============

  function formatLogEntry(log: ExerciseLog) {
    const entries = log.entries as { weight: number; reps: number }[];
    const date = new Date(log.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    const reps = entries.map((e) => `x${e.reps}`).join(",");
    return `${date}: ${entries[0]?.weight}lbs - ${reps}`;
  }

  function formatLogsForCell(logs: ExerciseLog[]) {
    if (logs.length === 0) return "No logs yet";
    return logs
      .slice(0, 5)
      .map(formatLogEntry)
      .join(" | ");
  }

  const exerciseCount = templates.reduce((acc, t) => acc + t.exercises.length, 0);
  const totalSets = templates.reduce(
    (acc, t) =>
      acc +
      t.exercises.reduce((s, e) => {
        const m = e.sets.match(/\d+/);
        return s + (m ? parseInt(m[0]) : 0);
      }, 0),
    0,
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-16 pb-4">
        <div className="t-kicker mb-2">04 · fitness</div>
        <div className="flex items-end justify-between">
          <h1 className="t-display text-[44px] text-[var(--fg)]">Fitness</h1>
          <Chip tone="orange">{templates.length} workouts</Chip>
        </div>
      </div>

      {/* Feature tile */}
      <div className="px-4 pb-3">
        <div className="tile tile--elev edge-orange p-5">
          <div className="t-kicker mb-2">your stack</div>
          <div className="flex items-end justify-between">
            <span
              className="t-display glow-orange"
              style={{ fontSize: 50, color: "var(--orange)" }}
            >
              {exerciseCount}
              <span className="t-mono text-[16px] text-[var(--fg-mute)]">
                /{totalSets} sets
              </span>
            </span>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="t-caps">exercises</span>
              <span className="t-mono text-[10px] text-[var(--fg-mute)]">
                across {templates.length} workouts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add new workout */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="t-kicker flex-1">all workouts</span>
        <button
          type="button"
          onClick={openNewTemplate}
          aria-label="New workout"
          className="flex items-center gap-1.5 px-3 py-1.5"
          style={{
            borderRadius: 99,
            background: "linear-gradient(135deg, var(--orange), var(--pink))",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 24px -12px rgba(255,107,53,0.5)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="t-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            New
          </span>
        </button>
      </div>

      {/* Templates */}
      <div className="px-4 pt-1 space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,107,53,0.08)",
                border: "1px solid rgba(255,107,53,0.2)",
              }}
            >
              <Dumbbell className="w-7 h-7" style={{ color: "var(--orange)" }} />
            </div>
            <div className="t-display text-[22px]" style={{ color: "var(--fg-dim)" }}>
              No workouts yet
            </div>
            <p className="t-mono mt-2 mb-4" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
              create your first workout template
            </p>
            <Button
              onClick={openNewTemplate}
              style={{
                background: "linear-gradient(135deg, var(--orange), var(--pink))",
                color: "#fff",
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Workout
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <motion.div
              key={template.id}
              layout
              className="tile overflow-hidden"
            >
              {/* Template Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleTemplate(template.id)}
              >
                <div className="flex items-center gap-3">
                  <button className="text-[color:var(--fg-mute)]">
                    {expandedTemplates.has(template.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h2 className="font-bold text-white text-lg">{template.name}</h2>
                    <p className="text-xs text-[color:var(--fg-mute)]">
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""} •{" "}
                      {template.exercises.reduce((acc, e) => {
                        const match = e.sets.match(/\d+/);
                        return acc + (match ? parseInt(match[0]) : 0);
                      }, 0)} total sets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditTemplate(template)}
                    className="p-2 text-[color:var(--fg-mute)] hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-[color:var(--fg-mute)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exercises Table */}
              <AnimatePresence>
                {expandedTemplates.has(template.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-[color:var(--line)]">
                      {/* Exercise Cards */}
                      <div className="divide-y divide-[color:var(--line-soft)]">
                        {template.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="px-4 py-3 hover:bg-white/5 transition-colors"
                          >
                            {/* Exercise Header Row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">{exercise.name}</p>
                                <p className="text-xs text-[color:var(--fg-mute)] mt-0.5">
                                  {exercise.sets} • {exercise.repRange} reps
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => openLogExercise(exercise)}
                                  className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Log workout"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditExercise(exercise)}
                                  className="p-2 text-[color:var(--fg-mute)] hover:text-white transition-colors"
                                  title="Edit exercise"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Recent Log */}
                            <div className="text-xs text-[color:var(--fg-mute)]/60 bg-white/[0.03] rounded-lg px-2 py-1.5">
                              {exercise.logs.length > 0 ? (
                                formatLogEntry(exercise.logs[0])
                              ) : (
                                "No logs yet"
                              )}
                            </div>
                          </div>
                        ))}

                        {template.exercises.length === 0 && (
                          <div className="px-4 py-6 text-center text-[color:var(--fg-mute)] text-sm">
                            No exercises yet. Add your first one.
                          </div>
                        )}
                      </div>

                      {/* Add Exercise Button */}
                      <div className="p-3 border-t border-[color:var(--line-soft)]">
                        <button
                          onClick={() => openNewExercise(template.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[color:var(--fg-mute)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Exercise
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Template Sheet */}
      <Sheet open={templateSheetOpen} onOpenChange={setTemplateSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">
              {editingTemplate ? "Edit Workout" : "New Workout"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Workout Name</label>
              <Input
                placeholder="e.g. PUSH DAY, PULL DAY, LEGS"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60 uppercase"
              />
            </div>

            <Button
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
              onClick={handleSaveTemplate}
              disabled={isPending || !templateName.trim()}
            >
              {isPending ? "Saving..." : editingTemplate ? "Update Workout" : "Create Workout"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Exercise Sheet */}
      <Sheet open={exerciseSheetOpen} onOpenChange={setExerciseSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[70vh] overflow-y-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">
              {editingExercise ? "Edit Exercise" : "Add Exercise"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Exercise Name</label>
              <Input
                placeholder="e.g. Smith Incline Chest Press (24hr)"
                value={exerciseForm.name}
                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Sets</label>
                <Input
                  placeholder="e.g. 2 Working Sets"
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Rep Range</label>
                <Input
                  placeholder="e.g. 8-12"
                  value={exerciseForm.repRange}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, repRange: e.target.value })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Notes (optional)</label>
              <Input
                placeholder="e.g. Equipment, tips, etc."
                value={exerciseForm.notes}
                onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
                onClick={handleSaveExercise}
                disabled={isPending || !exerciseForm.name.trim()}
              >
                {isPending ? "Saving..." : editingExercise ? "Update" : "Add Exercise"}
              </Button>
              {editingExercise && (
                <Button
                  variant="outline"
                  className="h-12 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDeleteExercise(editingExercise.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Log Sheet */}
      <Sheet open={logSheetOpen} onOpenChange={setLogSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-auto bg-[var(--ink-100)] border-[color:var(--line)] px-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[color:var(--fg)]">
              Log: {loggingExercise?.name}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <p className="text-sm text-[color:var(--fg-mute)]">
              Target: {loggingExercise?.sets} @ {loggingExercise?.repRange} reps
            </p>

            <div>
              <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Weight (lbs)</label>
              <Input
                type="number"
                placeholder="e.g. 135"
                value={logForm.weight}
                onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Set 1 Reps</label>
                <Input
                  type="number"
                  placeholder="e.g. 8"
                  value={logForm.reps}
                  onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[color:var(--fg-mute)]">Set 2 Reps (optional)</label>
                <Input
                  type="number"
                  placeholder="e.g. 6"
                  value={logForm.reps2}
                  onChange={(e) => setLogForm({ ...logForm, reps2: e.target.value })}
                  className="bg-white/[0.04] border-[color:var(--line)] text-white placeholder:text-[color:var(--fg-mute)]/60"
                />
              </div>
            </div>

            {loggingExercise && loggingExercise.logs.length > 0 && (
              <div className="bg-white/[0.03] rounded-xl p-3">
                <p className="text-xs font-medium text-[color:var(--fg-mute)] mb-2">Recent logs:</p>
                <p className="text-sm text-white/80">
                  {loggingExercise.logs.slice(0, 3).map(formatLogEntry).join(" | ")}
                </p>
              </div>
            )}

            <Button
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
              onClick={handleSaveLog}
              disabled={isPending || !logForm.weight || !logForm.reps}
            >
              {isPending ? "Saving..." : "Log Workout"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
