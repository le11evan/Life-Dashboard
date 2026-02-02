"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStartOfDayLA } from "@/lib/utils";
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
  const targetDate = date ? getStartOfDayLA(date) : getStartOfDayLA();

  return db.dietLog.findUnique({
    where: { date: targetDate },
  });
}

export async function getDietLogs(days: number = 7) {
  const startDate = getStartOfDayLA();
  startDate.setDate(startDate.getDate() - days);

  return db.dietLog.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: "desc" },
  });
}

export async function upsertDietLog(input: DietLogInput) {
  const validated = dietLogSchema.parse(input);

  const date = validated.date ? getStartOfDayLA(new Date(validated.date)) : getStartOfDayLA();

  const log = await db.dietLog.upsert({
    where: { date },
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
  let goals = await db.dietGoals.findFirst();

  if (!goals) {
    goals = await db.dietGoals.create({
      data: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
        fiber: 30,
        water: 100, // oz
      },
    });
  }

  return goals;
}

export async function updateDietGoals(input: DietGoalsInput) {
  const validated = dietGoalsSchema.parse(input);

  let goals = await db.dietGoals.findFirst();

  if (goals) {
    goals = await db.dietGoals.update({
      where: { id: goals.id },
      data: validated,
    });
  } else {
    goals = await db.dietGoals.create({
      data: validated,
    });
  }

  revalidatePath("/diet");
  return goals;
}

// ============ SUPPLEMENTS ============

export async function getSupplements(activeOnly: boolean = false) {
  return db.supplement.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: [
      { isActive: "desc" },
      { timeOfDay: "asc" },
      { name: "asc" },
    ],
  });
}

export async function createSupplement(input: SupplementInput) {
  const validated = supplementSchema.parse(input);

  const supplement = await db.supplement.create({
    data: {
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
  const supplement = await db.supplement.update({
    where: { id },
    data: input,
  });

  revalidatePath("/diet");
  return supplement;
}

export async function toggleSupplementActive(id: string) {
  const supplement = await db.supplement.findUnique({ where: { id } });
  if (!supplement) throw new Error("Supplement not found");

  const updated = await db.supplement.update({
    where: { id },
    data: { isActive: !supplement.isActive },
  });

  revalidatePath("/diet");
  return updated;
}

export async function deleteSupplement(id: string) {
  await db.supplement.delete({ where: { id } });
  revalidatePath("/diet");
}

// ============ WEIGHT LOG ============

export async function getWeightLogs(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return db.weightLog.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });
}

export async function getLatestWeight() {
  return db.weightLog.findFirst({
    orderBy: { date: "desc" },
  });
}

export async function logWeight(input: WeightLogInput) {
  const validated = weightLogSchema.parse(input);

  const date = validated.date ? new Date(validated.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const log = await db.weightLog.upsert({
    where: { date },
    update: {
      weight: validated.weight,
      notes: validated.notes,
    },
    create: {
      date,
      weight: validated.weight,
      notes: validated.notes,
    },
  });

  revalidatePath("/diet");
  return log;
}

export async function deleteWeightLog(id: string) {
  await db.weightLog.delete({ where: { id } });
  revalidatePath("/diet");
}

// ============ DIET STATS ============

export async function getDietStats() {
  const [supplements, latestWeight, goals] = await Promise.all([
    db.supplement.count({ where: { isActive: true } }),
    db.weightLog.findFirst({ orderBy: { date: "desc" } }),
    getDietGoals(),
  ]);

  return {
    activeSupplements: supplements,
    currentWeight: latestWeight?.weight || null,
    goals,
  };
}
