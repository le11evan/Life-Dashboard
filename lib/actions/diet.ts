"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStartOfDayLA } from "@/lib/utils";
import { requireUser } from "@/lib/session";
import {
  dietLogSchema,
  dietGoalsSchema,
  supplementSchema,
  weightLogSchema,
  type DietLogInput,
  type DietGoalsInput,
  type SupplementInput,
  type WeightLogInput,
} from "@/lib/validations/diet";

// ============ DIET LOG ============

export async function getDietLog(date?: Date) {
  const user = await requireUser();
  const targetDate = date ? getStartOfDayLA(date) : getStartOfDayLA();

  return db.dietLog.findUnique({
    where: { userId_date: { userId: user.id, date: targetDate } },
  });
}

export async function getDietLogs(days: number = 7) {
  const user = await requireUser();
  const startDate = getStartOfDayLA();
  startDate.setDate(startDate.getDate() - days);

  return db.dietLog.findMany({
    where: { userId: user.id, date: { gte: startDate } },
    orderBy: { date: "desc" },
  });
}

export async function upsertDietLog(input: DietLogInput) {
  const user = await requireUser();
  const validated = dietLogSchema.parse(input);

  const date = validated.date ? getStartOfDayLA(new Date(validated.date)) : getStartOfDayLA();

  const log = await db.dietLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      calories: validated.calories,
      protein: validated.protein,
      carbs: validated.carbs,
      fat: validated.fat,
      fiber: validated.fiber,
      water: validated.water,
      notes: validated.notes,
    },
    create: {
      userId: user.id,
      date,
      calories: validated.calories,
      protein: validated.protein,
      carbs: validated.carbs,
      fat: validated.fat,
      fiber: validated.fiber,
      water: validated.water,
      notes: validated.notes,
    },
  });

  revalidatePath("/diet");
  return log;
}

// ============ DIET GOALS ============

export async function getDietGoals() {
  const user = await requireUser();
  let goals = await db.dietGoals.findUnique({ where: { userId: user.id } });

  if (!goals) {
    goals = await db.dietGoals.create({
      data: {
        userId: user.id,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
        fiber: 30,
        water: 100,
      },
    });
  }

  return goals;
}

export async function updateDietGoals(input: DietGoalsInput) {
  const user = await requireUser();
  const validated = dietGoalsSchema.parse(input);

  const goals = await db.dietGoals.upsert({
    where: { userId: user.id },
    update: validated,
    create: { userId: user.id, ...validated },
  });

  revalidatePath("/diet");
  return goals;
}

// ============ SUPPLEMENTS ============

export async function getSupplements(activeOnly: boolean = false) {
  const user = await requireUser();
  return db.supplement.findMany({
    where: activeOnly
      ? { userId: user.id, isActive: true }
      : { userId: user.id },
    orderBy: [
      { isActive: "desc" },
      { timeOfDay: "asc" },
      { name: "asc" },
    ],
  });
}

export async function createSupplement(input: SupplementInput) {
  const user = await requireUser();
  const validated = supplementSchema.parse(input);

  const supplement = await db.supplement.create({
    data: {
      userId: user.id,
      name: validated.name,
      dosage: validated.dosage,
      frequency: validated.frequency,
      timeOfDay: validated.timeOfDay,
      notes: validated.notes,
      isActive: validated.isActive,
    },
  });

  revalidatePath("/diet");
  return supplement;
}

export async function updateSupplement(id: string, input: Partial<SupplementInput>) {
  const user = await requireUser();
  const res = await db.supplement.updateMany({
    where: { id, userId: user.id },
    data: input,
  });
  if (res.count === 0) throw new Error("Supplement not found");

  revalidatePath("/diet");
  return db.supplement.findUniqueOrThrow({ where: { id } });
}

export async function toggleSupplementActive(id: string) {
  const user = await requireUser();
  const supplement = await db.supplement.findFirst({ where: { id, userId: user.id } });
  if (!supplement) throw new Error("Supplement not found");

  const updated = await db.supplement.update({
    where: { id },
    data: { isActive: !supplement.isActive },
  });

  revalidatePath("/diet");
  return updated;
}

export async function deleteSupplement(id: string) {
  const user = await requireUser();
  await db.supplement.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/diet");
}

// ============ WEIGHT LOG ============

export async function getWeightLogs(days: number = 30) {
  const user = await requireUser();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return db.weightLog.findMany({
    where: { userId: user.id, date: { gte: startDate } },
    orderBy: { date: "asc" },
  });
}

export async function getLatestWeight() {
  const user = await requireUser();
  return db.weightLog.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
}

export async function logWeight(input: WeightLogInput) {
  const user = await requireUser();
  const validated = weightLogSchema.parse(input);

  const date = validated.date ? new Date(validated.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const log = await db.weightLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      weight: validated.weight,
      notes: validated.notes,
    },
    create: {
      userId: user.id,
      date,
      weight: validated.weight,
      notes: validated.notes,
    },
  });

  revalidatePath("/diet");
  return log;
}

export async function deleteWeightLog(id: string) {
  const user = await requireUser();
  await db.weightLog.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/diet");
}

// ============ DIET STATS ============

export async function getDietStats() {
  const user = await requireUser();
  const [supplements, latestWeight, goals] = await Promise.all([
    db.supplement.count({ where: { userId: user.id, isActive: true } }),
    db.weightLog.findFirst({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    getDietGoals(),
  ]);

  return {
    activeSupplements: supplements,
    currentWeight: latestWeight?.weight || null,
    goals,
  };
}
