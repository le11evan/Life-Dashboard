import { z } from "zod";

export const createJournalEntrySchema = z.object({
  content: z.string().min(1, "Content is required").max(50000),
  tags: z.array(z.string().max(50)).max(10).default([]),
  mood: z.string().max(50).optional().nullable(),
});

export const updateJournalEntrySchema = z.object({
  id: z.string().cuid(),
  content: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  mood: z.string().max(50).optional().nullable(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;

export const MOOD_OPTIONS = [
  { value: "great", label: "Great", emoji: "😊" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "bad", label: "Bad", emoji: "😢" },
] as const;
