import { z } from "zod";

export const createQuoteSchema = z.object({
  quote: z.string().min(1, "Quote is required").max(2000),
  author: z.string().max(200).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
