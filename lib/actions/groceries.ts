"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createGroceryItemSchema,
  updateGroceryItemSchema,
  type CreateGroceryItemInput,
  type UpdateGroceryItemInput,
} from "@/lib/validations/grocery";

export async function getGroceryItems() {
  const user = await requireUser();
  return db.groceryItem.findMany({
    where: { userId: user.id },
    orderBy: [
      { isChecked: "asc" },
      { category: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getGroceryItemsCount() {
  const user = await requireUser();
  const [total, unchecked] = await Promise.all([
    db.groceryItem.count({ where: { userId: user.id } }),
    db.groceryItem.count({ where: { userId: user.id, isChecked: false } }),
  ]);
  return { total, unchecked };
}

export async function createGroceryItem(input: CreateGroceryItemInput) {
  const user = await requireUser();
  const validated = createGroceryItemSchema.parse(input);

  const item = await db.groceryItem.create({
    data: {
      userId: user.id,
      name: validated.name,
      category: validated.category,
    },
  });

  revalidatePath("/groceries");
  revalidatePath("/");
  return item;
}

export async function updateGroceryItem(input: UpdateGroceryItemInput) {
  const user = await requireUser();
  const validated = updateGroceryItemSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.isChecked !== undefined) updateData.isChecked = data.isChecked;

  const res = await db.groceryItem.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Item not found");

  revalidatePath("/groceries");
  revalidatePath("/");
  return db.groceryItem.findUniqueOrThrow({ where: { id } });
}

export async function toggleGroceryItem(id: string) {
  const user = await requireUser();
  const item = await db.groceryItem.findFirst({ where: { id, userId: user.id } });
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
  const user = await requireUser();
  await db.groceryItem.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/groceries");
  revalidatePath("/");
}

export async function clearCheckedItems() {
  const user = await requireUser();
  await db.groceryItem.deleteMany({ where: { userId: user.id, isChecked: true } });
  revalidatePath("/groceries");
  revalidatePath("/");
}
