"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  type CreateJournalEntryInput,
  type UpdateJournalEntryInput,
} from "@/lib/validations/journal";

export async function getJournalEntries(search?: string) {
  const where = search
    ? {
        OR: [
          { content: { contains: search, mode: "insensitive" as const } },
          { tags: { hasSome: [search] } },
        ],
      }
    : {};

  return db.journalEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getJournalEntry(id: string) {
  return db.journalEntry.findUnique({ where: { id } });
}

export async function getJournalStreak() {
  const entries = await db.journalEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
    take: 100,
  });

  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's an entry today or yesterday to start the streak
  const lastEntryDate = new Date(entries[0].createdAt);
  lastEntryDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return db.journalEntry.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
}

export async function createJournalEntry(input: CreateJournalEntryInput) {
  const validated = createJournalEntrySchema.parse(input);

  const entry = await db.journalEntry.create({
    data: {
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
  const validated = updateJournalEntrySchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.content !== undefined) updateData.content = data.content;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.mood !== undefined) updateData.mood = data.mood;

  const entry = await db.journalEntry.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/journal");
  revalidatePath("/");
  return entry;
}

export async function deleteJournalEntry(id: string) {
  await db.journalEntry.delete({ where: { id } });
  revalidatePath("/journal");
  revalidatePath("/");
}
