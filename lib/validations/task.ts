import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  notes: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(0).max(3).default(0),
});

export const updateTaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(500).optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["pending", "completed"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(0).max(3).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
