import { z } from "zod";

export const setSchema = z.object({
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  notes: z.string().max(200).optional(),
});

export const exerciseInputSchema = z.object({
  exerciseName: z.string().min(1).max(100),
  sets: z.array(setSchema).min(1).max(20),
  notes: z.string().max(500).optional().nullable(),
});

export const createWorkoutSchema = z.object({
  date: z.string().datetime().optional(),
  name: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  exercises: z.array(exerciseInputSchema).min(1),
});

export const updateWorkoutSchema = z.object({
  id: z.string().cuid(),
  date: z.string().datetime().optional(),
  name: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const addExerciseSchema = z.object({
  workoutId: z.string().cuid(),
  exerciseName: z.string().min(1).max(100),
  sets: z.array(setSchema).min(1).max(20),
  notes: z.string().max(500).optional().nullable(),
});

export type SetInput = z.infer<typeof setSchema>;
export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

// Common exercises for autocomplete
export const COMMON_EXERCISES = [
  // Chest
  "Bench Press",
  "Incline Bench Press",
  "Dumbbell Press",
  "Incline Dumbbell Press",
  "Cable Flyes",
  "Push-ups",
  "Dips",
  // Back
  "Pull-ups",
  "Lat Pulldown",
  "Barbell Row",
  "Dumbbell Row",
  "Cable Row",
  "Deadlift",
  "Face Pulls",
  // Shoulders
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Lateral Raises",
  "Front Raises",
  "Rear Delt Flyes",
  // Arms
  "Barbell Curl",
  "Dumbbell Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crushers",
  "Overhead Tricep Extension",
  // Legs
  "Squat",
  "Leg Press",
  "Lunges",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Calf Raises",
  // Core
  "Planks",
  "Crunches",
  "Hanging Leg Raises",
  "Cable Woodchops",
] as const;

export const WORKOUT_NAMES = [
  "Push Day",
  "Pull Day",
  "Leg Day",
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Chest & Triceps",
  "Back & Biceps",
  "Shoulders & Arms",
  "Cardio",
] as const;
