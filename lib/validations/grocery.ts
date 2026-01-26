import { z } from "zod";

export const createGroceryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().max(50).optional().nullable(),
});

export const updateGroceryItemSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200).optional(),
  category: z.string().max(50).optional().nullable(),
  isChecked: z.boolean().optional(),
});

export type CreateGroceryItemInput = z.infer<typeof createGroceryItemSchema>;
export type UpdateGroceryItemInput = z.infer<typeof updateGroceryItemSchema>;

export const GROCERY_CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Frozen",
  "Pantry",
  "Beverages",
  "Snacks",
  "Household",
  "Other",
] as const;
