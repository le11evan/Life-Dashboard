"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStartOfDayLA } from "@/lib/utils";
import { requireUser } from "@/lib/session";

// ============ WORKOUT TEMPLATES ============

export async function getWorkoutTemplates() {
  const user = await requireUser();
  return db.workoutTemplate.findMany({
    where: { userId: user.id },
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
    orderBy: { order: "asc" },
  });
}

export async function getWorkoutTemplate(id: string) {
  const user = await requireUser();
  return db.workoutTemplate.findFirst({
    where: { id, userId: user.id },
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
  const user = await requireUser();
  const maxOrder = await db.workoutTemplate.aggregate({
    where: { userId: user.id },
    _max: { order: true },
  });

  const template = await db.workoutTemplate.create({
    data: {
      userId: user.id,
      name: name.toUpperCase(),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/fitness");
  return template;
}

export async function updateWorkoutTemplate(id: string, name: string) {
  const user = await requireUser();
  const res = await db.workoutTemplate.updateMany({
    where: { id, userId: user.id },
    data: { name: name.toUpperCase() },
  });
  if (res.count === 0) throw new Error("Template not found");

  revalidatePath("/fitness");
  return db.workoutTemplate.findUniqueOrThrow({ where: { id } });
}

export async function deleteWorkoutTemplate(id: string) {
  const user = await requireUser();
  await db.workoutTemplate.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/fitness");
}

export async function reorderWorkoutTemplates(ids: string[]) {
  const user = await requireUser();
  await Promise.all(
    ids.map((id, index) =>
      db.workoutTemplate.updateMany({
        where: { id, userId: user.id },
        data: { order: index },
      })
    )
  );
  revalidatePath("/fitness");
}

// ============ TEMPLATE EXERCISES ============
// Scoped via parent template — verify the template belongs to the user before mutating.

async function assertOwnsExercise(exerciseId: string, userId: string) {
  const ex = await db.templateExercise.findFirst({
    where: { id: exerciseId, template: { userId } },
    select: { id: true },
  });
  if (!ex) throw new Error("Exercise not found");
}

async function assertOwnsTemplate(templateId: string, userId: string) {
  const tpl = await db.workoutTemplate.findFirst({
    where: { id: templateId, userId },
    select: { id: true },
  });
  if (!tpl) throw new Error("Template not found");
}

export async function addExercise(
  templateId: string,
  data: { name: string; sets: string; repRange: string; notes?: string }
) {
  const user = await requireUser();
  await assertOwnsTemplate(templateId, user.id);
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
  const user = await requireUser();
  await assertOwnsExercise(id, user.id);

  const exercise = await db.templateExercise.update({
    where: { id },
    data,
  });

  revalidatePath("/fitness");
  return exercise;
}

export async function deleteExercise(id: string) {
  const user = await requireUser();
  await assertOwnsExercise(id, user.id);
  await db.templateExercise.delete({ where: { id } });
  revalidatePath("/fitness");
}

export async function reorderExercises(templateId: string, exerciseIds: string[]) {
  const user = await requireUser();
  await assertOwnsTemplate(templateId, user.id);
  await Promise.all(
    exerciseIds.map((id, index) =>
      db.templateExercise.updateMany({
        where: { id, template: { userId: user.id } },
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
  const user = await requireUser();
  await assertOwnsExercise(exerciseId, user.id);
  const logDate = getStartOfDayLA(date);

  const log = await db.exerciseLog.upsert({
    where: {
      exerciseId_date: { exerciseId, date: logDate },
    },
    update: { entries },
    create: { exerciseId, date: logDate, entries },
  });

  revalidatePath("/fitness");
  return log;
}

export async function deleteExerciseLog(id: string) {
  const user = await requireUser();
  const log = await db.exerciseLog.findFirst({
    where: { id, exercise: { template: { userId: user.id } } },
    select: { id: true },
  });
  if (!log) throw new Error("Log not found");
  await db.exerciseLog.delete({ where: { id } });
  revalidatePath("/fitness");
}

export async function getExerciseLogs(exerciseId: string, limit: number = 10) {
  const user = await requireUser();
  await assertOwnsExercise(exerciseId, user.id);
  return db.exerciseLog.findMany({
    where: { exerciseId },
    orderBy: { date: "desc" },
    take: limit,
  });
}

// ============ STATS FOR DASHBOARD ============

export async function getFitnessStats() {
  const user = await requireUser();
  const [templateCount, exerciseCount, recentLogs] = await Promise.all([
    db.workoutTemplate.count({ where: { userId: user.id } }),
    db.templateExercise.count({ where: { template: { userId: user.id } } }),
    db.exerciseLog.findMany({
      where: {
        exercise: { template: { userId: user.id } },
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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
