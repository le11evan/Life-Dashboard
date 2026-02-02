import { z } from "zod";

export const dietLogSchema = z.object({
  date: z.string().datetime().optional(),
  calories: z.number().int().min(0).max(10000).default(0),
  protein: z.number().int().min(0).max(1000).default(0),
  carbs: z.number().int().min(0).max(1000).default(0),
  fat: z.number().int().min(0).max(500).default(0),
  fiber: z.number().int().min(0).max(200).default(0),
  water: z.number().min(0).max(300).default(0), // oz
  notes: z.string().max(500).optional().nullable(),
});

export const dietGoalsSchema = z.object({
  calories: z.number().int().min(500).max(10000).default(2000),
  protein: z.number().int().min(0).max(500).default(150),
  carbs: z.number().int().min(0).max(1000).default(200),
  fat: z.number().int().min(0).max(300).default(65),
  fiber: z.number().int().min(0).max(100).default(30),
  water: z.number().min(0).max(300).default(100), // oz
});

export const supplementSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dosage: z.string().max(50).optional().nullable(),
  frequency: z.enum(["daily", "twice-daily", "three-times", "weekly", "as-needed"]).default("daily"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "with-meals", "pre-workout", "post-workout", "bedtime"]).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const weightLogSchema = z.object({
  date: z.string().datetime().optional(),
  weight: z.number().min(50).max(1000),
  notes: z.string().max(500).optional().nullable(),
});

export type DietLogInput = z.infer<typeof dietLogSchema>;
export type DietGoalsInput = z.infer<typeof dietGoalsSchema>;
export type SupplementInput = z.infer<typeof supplementSchema>;
export type WeightLogInput = z.infer<typeof weightLogSchema>;

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice-daily", label: "Twice Daily" },
  { value: "three-times", label: "3x Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as-needed", label: "As Needed" },
] as const;

export const TIME_OF_DAY_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "with-meals", label: "With Meals" },
  { value: "pre-workout", label: "Pre-Workout" },
  { value: "post-workout", label: "Post-Workout" },
  { value: "bedtime", label: "Bedtime" },
] as const;
