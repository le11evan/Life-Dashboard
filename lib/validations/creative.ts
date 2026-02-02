import { z } from "zod";

export const createIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(5000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const updateIdeaSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(5000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPinned: z.boolean().optional(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;

export const IDEA_CATEGORIES = [
  "Music",
  "Writing",
  "Design",
  "Business",
  "App Ideas",
  "Content",
  "Other",
] as const;
