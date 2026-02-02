"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStartOfDayLA } from "@/lib/utils";

// ============ WORKOUT TEMPLATES ============

export async function getWorkoutTemplates() {
  return db.workoutTemplate.findMany({
    include: {
      exercises: {
        include: {
          logs: {
            orderBy: { date: "desc" },
            take: 10, // Get last 10 log entries per exercise
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getWorkoutTemplate(id: string) {
  return db.workoutTemplate.findUnique({
    where: { id },
    include: {
      exercises: {
        include: {
          logs: {
            orderBy: { date: "desc" },
            take: 10,
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function createWorkoutTemplate(name: string) {
  const maxOrder = await db.workoutTemplate.aggregate({
    _max: { order: true },
  });

  const template = await db.workoutTemplate.create({
    data: {
      name: name.toUpperCase(),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/fitness");
  return template;
}

export async function updateWorkoutTemplate(id: string, name: string) {
  const template = await db.workoutTemplate.update({
    where: { id },
    data: { name: name.toUpperCase() },
  });

  revalidatePath("/fitness");
  return template;
}

export async function deleteWorkoutTemplate(id: string) {
  await db.workoutTemplate.delete({ where: { id } });
  revalidatePath("/fitness");
}

export async function reorderWorkoutTemplates(ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      db.workoutTemplate.update({
        where: { id },
        data: { order: index },
      })
    )
  );
  revalidatePath("/fitness");
}

// ============ TEMPLATE EXERCISES ============

export async function addExercise(
  templateId: string,
  data: { name: string; sets: string; repRange: string; notes?: string }
) {
  const maxOrder = await db.templateExercise.aggregate({
    where: { templateId },
    _max: { order: true },
  });

  const exercise = await db.templateExercise.create({
    data: {
      templateId,
      name: data.name,
      sets: data.sets,
      repRange: data.repRange,
      notes: data.notes,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/fitness");
  return exercise;
}

export async function updateExercise(
  id: string,
  data: { name?: string; sets?: string; repRange?: string; notes?: string | null }
) {
  const exercise = await db.templateExercise.update({
    where: { id },
    data,
  });

  revalidatePath("/fitness");
  return exercise;
}

export async function deleteExercise(id: string) {
  await db.templateExercise.delete({ where: { id } });
  revalidatePath("/fitness");
}

export async function reorderExercises(templateId: string, exerciseIds: string[]) {
  await Promise.all(
    exerciseIds.map((id, index) =>
      db.templateExercise.update({
        where: { id },
        data: { order: index },
      })
    )
  );
  revalidatePath("/fitness");
}

// ============ EXERCISE LOGS ============

export async function logExercise(
  exerciseId: string,
  date: Date,
  entries: { weight: number; reps: number }[]
) {
  const logDate = getStartOfDayLA(date);

  const log = await db.exerciseLog.upsert({
    where: {
      exerciseId_date: {
        exerciseId,
        date: logDate,
      },
    },
    update: {
      entries,
    },
    create: {
      exerciseId,
      date: logDate,
      entries,
    },
  });

  revalidatePath("/fitness");
  return log;
}

export async function deleteExerciseLog(id: string) {
  await db.exerciseLog.delete({ where: { id } });
  revalidatePath("/fitness");
}

export async function getExerciseLogs(exerciseId: string, limit: number = 10) {
  return db.exerciseLog.findMany({
    where: { exerciseId },
    orderBy: { date: "desc" },
    take: limit,
  });
}

// ============ STATS FOR DASHBOARD ============

export async function getFitnessStats() {
  const [templateCount, exerciseCount, recentLogs] = await Promise.all([
    db.workoutTemplate.count(),
    db.templateExercise.count(),
    db.exerciseLog.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: { date: true },
      distinct: ["date"],
    }),
  ]);

  return {
    templateCount,
    exerciseCount,
    workoutsThisWeek: recentLogs.length,
  };
}
