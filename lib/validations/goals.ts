import { z } from "zod";

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["short", "long"]).default("short"),
  targetDate: z.string().datetime().optional().nullable(),
});

export const updateGoalSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["short", "long"]).optional(),
  status: z.enum(["active", "completed", "paused"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  targetDate: z.string().datetime().optional().nullable(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
