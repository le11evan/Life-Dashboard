"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createIdeaSchema,
  updateIdeaSchema,
  type CreateIdeaInput,
  type UpdateIdeaInput,
} from "@/lib/validations/creative";

export async function getIdeas(category?: string) {
  const user = await requireUser();
  const where = category ? { userId: user.id, category } : { userId: user.id };
  return db.creativeIdea.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function getIdeaStats() {
  const user = await requireUser();
  const [total, pinned] = await Promise.all([
    db.creativeIdea.count({ where: { userId: user.id } }),
    db.creativeIdea.count({ where: { userId: user.id, isPinned: true } }),
  ]);
  return { total, pinned };
}

export async function createIdea(input: CreateIdeaInput) {
  const user = await requireUser();
  const validated = createIdeaSchema.parse(input);

  const idea = await db.creativeIdea.create({
    data: {
      userId: user.id,
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
  const user = await requireUser();
  const validated = updateIdeaSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;

  const res = await db.creativeIdea.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Idea not found");

  revalidatePath("/creative");
  revalidatePath("/");
  return db.creativeIdea.findUniqueOrThrow({ where: { id } });
}

export async function deleteIdea(id: string) {
  const user = await requireUser();
  await db.creativeIdea.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/creative");
  revalidatePath("/");
}

export async function toggleIdeaPin(id: string) {
  const user = await requireUser();
  const idea = await db.creativeIdea.findFirst({ where: { id, userId: user.id } });
  if (!idea) throw new Error("Idea not found");

  await db.creativeIdea.update({
    where: { id },
    data: { isPinned: !idea.isPinned },
  });

  revalidatePath("/creative");
  revalidatePath("/");
}
