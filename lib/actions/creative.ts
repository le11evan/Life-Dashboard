"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createIdeaSchema,
  updateIdeaSchema,
  type CreateIdeaInput,
  type UpdateIdeaInput,
} from "@/lib/validations/creative";

export async function getIdeas(category?: string) {
  const where = category ? { category } : {};
  return db.creativeIdea.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function getIdeaStats() {
  const [total, pinned] = await Promise.all([
    db.creativeIdea.count(),
    db.creativeIdea.count({ where: { isPinned: true } }),
  ]);
  return { total, pinned };
}

export async function createIdea(input: CreateIdeaInput) {
  const validated = createIdeaSchema.parse(input);

  const idea = await db.creativeIdea.create({
    data: {
      title: validated.title,
      content: validated.content,
      category: validated.category,
      tags: validated.tags,
    },
  });

  revalidatePath("/creative");
  revalidatePath("/");
  return idea;
}

export async function updateIdea(input: UpdateIdeaInput) {
  const validated = updateIdeaSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;

  const idea = await db.creativeIdea.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/creative");
  revalidatePath("/");
  return idea;
}

export async function deleteIdea(id: string) {
  await db.creativeIdea.delete({ where: { id } });
  revalidatePath("/creative");
  revalidatePath("/");
}

export async function toggleIdeaPin(id: string) {
  const idea = await db.creativeIdea.findUnique({ where: { id } });
  if (!idea) throw new Error("Idea not found");

  await db.creativeIdea.update({
    where: { id },
    data: { isPinned: !idea.isPinned },
  });

  revalidatePath("/creative");
  revalidatePath("/");
}
