"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
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
  createWorkout,
  deleteWorkout,
  getLastPerformance,
} from "@/lib/actions/fitness";
import {
  COMMON_EXERCISES,
  WORKOUT_NAMES,
  type SetInput,
  type ExerciseInput,
} from "@/lib/validations/fitness";
import type { Workout, WorkoutExercise } from "@prisma/client";

type WorkoutWithExercises = Workout & { exercises: WorkoutExercise[] };

interface FitnessClientProps {
  initialWorkouts: WorkoutWithExercises[];
  workoutsThisWeek: number;
  recentExercises: string[];
  openAdd?: boolean;
}

export function FitnessClient({
  initialWorkouts,
  workoutsThisWeek,
  recentExercises,
  openAdd = false,
}: FitnessClientProps) {
  const [isPending, startTransition] = useTransition();
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [addOpen, setAddOpen] = useState(openAdd);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // New workout state
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentSets, setCurrentSets] = useState<SetInput[]>([
    { weight: 0, reps: 0 },
  ]);
  const [exerciseNotes, setExerciseNotes] = useState("");
  const [lastPerformance, setLastPerformance] = useState<{
    date: Date;
    sets: SetInput[];
  } | null>(null);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);

  // Combined exercise list: recent first, then common
  const allExercises = [
    ...recentExercises,
    ...COMMON_EXERCISES.filter((e) => !recentExercises.includes(e)),
  ];

  const filteredExercises = currentExercise
    ? allExercises.filter((e) =>
        e.toLowerCase().includes(currentExercise.toLowerCase())
      )
    : allExercises;

  async function handleExerciseSelect(name: string) {
    setCurrentExercise(name);
    setShowExerciseSuggestions(false);

    // Fetch last performance for progressive overload
    const last = await getLastPerformance(name);
    setLastPerformance(last);

    // Pre-fill with last performance
    if (last && last.sets.length > 0) {
      setCurrentSets(last.sets.map((s) => ({ ...s })));
    }
  }

  function addSet() {
    const lastSet = currentSets[currentSets.length - 1];
    setCurrentSets([...currentSets, { weight: lastSet?.weight || 0, reps: lastSet?.reps || 0 }]);
  }

  function removeSet(index: number) {
    if (currentSets.length > 1) {
      setCurrentSets(currentSets.filter((_, i) => i !== index));
    }
  }

  function updateSet(index: number, field: "weight" | "reps", value: number) {
    setCurrentSets(
      currentSets.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      )
    );
  }

  function addExercise() {
    if (!currentExercise.trim() || currentSets.every((s) => s.reps === 0)) return;

    setExercises([
      ...exercises,
      {
        exerciseName: currentExercise.trim(),
        sets: currentSets.filter((s) => s.reps > 0),
        notes: exerciseNotes || null,
      },
    ]);

    // Reset for next exercise
    setCurrentExercise("");
    setCurrentSets([{ weight: 0, reps: 0 }]);
    setExerciseNotes("");
    setLastPerformance(null);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  async function handleSaveWorkout() {
    if (exercises.length === 0) return;

    startTransition(async () => {
      const workout = await createWorkout({
        name: workoutName || null,
        notes: workoutNotes || null,
        exercises,
      });
      setWorkouts([{ ...workout, exercises: workout.exercises } as WorkoutWithExercises, ...workouts]);
      resetForm();
      setAddOpen(false);
    });
  }

  function resetForm() {
    setWorkoutName("");
    setWorkoutNotes("");
    setExercises([]);
    setCurrentExercise("");
    setCurrentSets([{ weight: 0, reps: 0 }]);
    setExerciseNotes("");
    setLastPerformance(null);
  }

  async function handleDelete(id: string) {
    setWorkouts(workouts.filter((w) => w.id !== id));
    startTransition(async () => {
      await deleteWorkout(id);
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

  function formatSets(sets: SetInput[]) {
    if (sets.length === 0) return "";
    // Group same weight/reps
    const summary = sets.map((s) => `${s.weight}×${s.reps}`).join(", ");
    return summary;
  }

  function getTotalVolume(exercises: WorkoutExercise[]) {
    let total = 0;
    for (const ex of exercises) {
      const sets = ex.sets as SetInput[];
      for (const set of sets) {
        total += set.weight * set.reps;
      }
    }
    return total;
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
            <Dumbbell className="w-6 h-6" />
            Fitness
          </h1>
          <p className="text-muted-foreground">
            {workoutsThisWeek} workout{workoutsThisWeek !== 1 ? "s" : ""} this week
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Log Workout</span>
        </Button>
      </motion.div>

      {/* Workouts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {workouts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No workouts logged yet</p>
              <Button
                variant="link"
                onClick={() => setAddOpen(true)}
                className="mt-2"
              >
                Log your first workout
              </Button>
            </motion.div>
          ) : (
            workouts.map((workout) => {
              const isExpanded = expandedWorkout === workout.id;
              const volume = getTotalVolume(workout.exercises);

              return (
                <motion.div
                  key={workout.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Card className="rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedWorkout(isExpanded ? null : workout.id)
                      }
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {workout.name || "Workout"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(workout.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {workout.exercises.length} exercise
                            {workout.exercises.length !== 1 ? "s" : ""}
                            {volume > 0 && (
                              <span className="ml-2">
                                • {volume.toLocaleString()} lbs volume
                              </span>
                            )}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t"
                        >
                          <div className="p-4 space-y-3">
                            {workout.exercises.map((ex) => {
                              const sets = ex.sets as SetInput[];
                              return (
                                <div
                                  key={ex.id}
                                  className="bg-muted/50 rounded-lg p-3"
                                >
                                  <div className="font-medium text-sm">
                                    {ex.exerciseName}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {sets.map((s, i) => (
                                      <span key={i}>
                                        {i > 0 && " → "}
                                        {s.weight}lbs × {s.reps}
                                      </span>
                                    ))}
                                  </div>
                                  {ex.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {ex.notes}
                                    </p>
                                  )}
                                </div>
                              );
                            })}

                            {workout.notes && (
                              <p className="text-sm text-muted-foreground italic border-t pt-3">
                                {workout.notes}
                              </p>
                            )}

                            <div className="flex justify-end pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(workout.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Log Workout Sheet */}
      <Sheet open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Log Workout</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-8">
            {/* Workout Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Workout Name (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {WORKOUT_NAMES.map((name) => (
                  <Button
                    key={name}
                    type="button"
                    variant={workoutName === name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWorkoutName(workoutName === name ? "" : name)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Or type custom name..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            {/* Added Exercises */}
            {exercises.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Exercises ({exercises.length})
                </label>
                <div className="space-y-2">
                  {exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium text-sm">{ex.exerciseName}</div>
                        <div className="text-xs text-muted-foreground">
                          {ex.sets.length} sets • {formatSets(ex.sets)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Exercise */}
            <div className="border rounded-xl p-4 space-y-4">
              <label className="text-sm font-medium block">Add Exercise</label>

              {/* Exercise Name */}
              <div className="relative">
                <Input
                  placeholder="Exercise name..."
                  value={currentExercise}
                  onChange={(e) => {
                    setCurrentExercise(e.target.value);
                    setShowExerciseSuggestions(true);
                  }}
                  onFocus={() => setShowExerciseSuggestions(true)}
                />
                {showExerciseSuggestions && filteredExercises.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredExercises.slice(0, 10).map((name) => (
                      <button
                        key={name}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => handleExerciseSelect(name)}
                      >
                        {name}
                        {recentExercises.includes(name) && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (recent)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Last Performance */}
              {lastPerformance && (
                <div className="bg-primary/10 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-primary font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Last time ({formatDate(lastPerformance.date)}):
                  </div>
                  <div className="text-muted-foreground">
                    {lastPerformance.sets.map((s, i) => (
                      <span key={i}>
                        {i > 0 && " → "}
                        {s.weight}lbs × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sets</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSet}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Set
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentSets.map((set, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">
                        {i + 1}.
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="lbs"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSet(i, "weight", Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                        <span className="text-muted-foreground">×</span>
                        <Input
                          type="number"
                          placeholder="reps"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(i, "reps", Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                      </div>
                      {currentSets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSet(i)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise Notes */}
              <Input
                placeholder="Notes for this exercise (optional)"
                value={exerciseNotes}
                onChange={(e) => setExerciseNotes(e.target.value)}
              />

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={addExercise}
                disabled={!currentExercise.trim() || currentSets.every((s) => s.reps === 0)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {/* Workout Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Workout Notes (optional)
              </label>
              <textarea
                placeholder="How did it go? Any PRs?"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full min-h-[80px] resize-none border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Save Button */}
            <Button
              className="w-full h-12"
              onClick={handleSaveWorkout}
              disabled={isPending || exercises.length === 0}
            >
              {isPending ? "Saving..." : `Save Workout (${exercises.length} exercises)`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
