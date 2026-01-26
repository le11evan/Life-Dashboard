"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createGroceryItemSchema,
  updateGroceryItemSchema,
  type CreateGroceryItemInput,
  type UpdateGroceryItemInput,
} from "@/lib/validations/grocery";

export async function getGroceryItems() {
  return db.groceryItem.findMany({
    orderBy: [
      { isChecked: "asc" },
      { category: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getGroceryItemsCount() {
  const [total, unchecked] = await Promise.all([
    db.groceryItem.count(),
    db.groceryItem.count({ where: { isChecked: false } }),
  ]);
  return { total, unchecked };
}

export async function createGroceryItem(input: CreateGroceryItemInput) {
  const validated = createGroceryItemSchema.parse(input);

  const item = await db.groceryItem.create({
    data: {
      name: validated.name,
      category: validated.category,
    },
  });

  revalidatePath("/groceries");
  revalidatePath("/");
  return item;
}

export async function updateGroceryItem(input: UpdateGroceryItemInput) {
  const validated = updateGroceryItemSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.isChecked !== undefined) updateData.isChecked = data.isChecked;

  const item = await db.groceryItem.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/groceries");
  revalidatePath("/");
  return item;
}

export async function toggleGroceryItem(id: string) {
  const item = await db.groceryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  const updated = await db.groceryItem.update({
    where: { id },
    data: { isChecked: !item.isChecked },
  });

  revalidatePath("/groceries");
  revalidatePath("/");
  return updated;
}

export async function deleteGroceryItem(id: string) {
  await db.groceryItem.delete({ where: { id } });
  revalidatePath("/groceries");
  revalidatePath("/");
}

export async function clearCheckedItems() {
  await db.groceryItem.deleteMany({ where: { isChecked: true } });
  revalidatePath("/groceries");
  revalidatePath("/");
}
