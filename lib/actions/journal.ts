"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  type CreateJournalEntryInput,
  type UpdateJournalEntryInput,
} from "@/lib/validations/journal";

export async function getJournalEntries(search?: string) {
  const user = await requireUser();
  const where = search
    ? {
        userId: user.id,
        OR: [
          { content: { contains: search, mode: "insensitive" as const } },
          { tags: { hasSome: [search] } },
        ],
      }
    : { userId: user.id };

  return db.journalEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getJournalEntry(id: string) {
  const user = await requireUser();
  return db.journalEntry.findFirst({ where: { id, userId: user.id } });
}

export async function getJournalStreak() {
  const user = await requireUser();
  const entries = await db.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
    take: 100,
  });

  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntryDate = new Date(entries[0].createdAt);
  lastEntryDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff > 1) return 0;

  const seenDates = new Set<string>();
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    date.setHours(0, 0, 0, 0);
    seenDates.add(date.toISOString());
  }

  const checkDate = new Date(lastEntryDate);
  while (seenDates.has(checkDate.toISOString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export async function getRecentEntryCount() {
  const user = await requireUser();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return db.journalEntry.count({
    where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
  });
}

export async function createJournalEntry(input: CreateJournalEntryInput) {
  const user = await requireUser();
  const validated = createJournalEntrySchema.parse(input);

  const entry = await db.journalEntry.create({
    data: {
      userId: user.id,
      content: validated.content,
      tags: validated.tags,
      mood: validated.mood,
    },
  });

  revalidatePath("/journal");
  revalidatePath("/");
  return entry;
}

export async function updateJournalEntry(input: UpdateJournalEntryInput) {
  const user = await requireUser();
  const validated = updateJournalEntrySchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.content !== undefined) updateData.content = data.content;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.mood !== undefined) updateData.mood = data.mood;

  const res = await db.journalEntry.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Entry not found");

  revalidatePath("/journal");
  revalidatePath("/");
  return db.journalEntry.findUniqueOrThrow({ where: { id } });
}

export async function deleteJournalEntry(id: string) {
  const user = await requireUser();
  await db.journalEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/journal");
  revalidatePath("/");
}
