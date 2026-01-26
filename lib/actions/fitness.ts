"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createWorkoutSchema,
  addExerciseSchema,
  type CreateWorkoutInput,
  type AddExerciseInput,
  type SetInput,
} from "@/lib/validations/fitness";

export async function getWorkouts(limit?: number) {
  return db.workout.findMany({
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getWorkout(id: string) {
  return db.workout.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getWorkoutsThisWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return db.workout.count({
    where: {
      date: { gte: startOfWeek },
    },
  });
}

export async function getRecentExercises() {
  // Get unique exercise names from recent workouts
  const exercises = await db.workoutExercise.findMany({
    select: { exerciseName: true },
    distinct: ["exerciseName"],
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return exercises.map((e) => e.exerciseName);
}

export async function getExerciseHistory(exerciseName: string, limit = 5) {
  // Get recent entries for this exercise to show progressive overload
  const entries = await db.workoutExercise.findMany({
    where: { exerciseName },
    include: {
      workout: {
        select: { date: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return entries.map((entry) => ({
    date: entry.workout.date,
    sets: entry.sets as SetInput[],
    notes: entry.notes,
  }));
}

export async function getLastPerformance(exerciseName: string) {
  // Get the most recent performance of this exercise
  const last = await db.workoutExercise.findFirst({
    where: { exerciseName },
    include: {
      workout: {
        select: { date: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!last) return null;

  return {
    date: last.workout.date,
    sets: last.sets as SetInput[],
    notes: last.notes,
  };
}

export async function createWorkout(input: CreateWorkoutInput) {
  const validated = createWorkoutSchema.parse(input);

  const workout = await db.workout.create({
    data: {
      date: validated.date ? new Date(validated.date) : new Date(),
      name: validated.name,
      notes: validated.notes,
      exercises: {
        create: validated.exercises.map((ex, index) => ({
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          notes: ex.notes,
          order: index,
        })),
      },
    },
    include: {
      exercises: true,
    },
  });

  revalidatePath("/fitness");
  revalidatePath("/");
  return workout;
}

export async function addExerciseToWorkout(input: AddExerciseInput) {
  const validated = addExerciseSchema.parse(input);

  // Get the current max order
  const maxOrder = await db.workoutExercise.aggregate({
    where: { workoutId: validated.workoutId },
    _max: { order: true },
  });

  const exercise = await db.workoutExercise.create({
    data: {
      workoutId: validated.workoutId,
      exerciseName: validated.exerciseName,
      sets: validated.sets,
      notes: validated.notes,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/fitness");
  revalidatePath("/");
  return exercise;
}

export async function updateExercise(
  id: string,
  data: { sets?: SetInput[]; notes?: string | null }
) {
  const exercise = await db.workoutExercise.update({
    where: { id },
    data: {
      ...(data.sets !== undefined && { sets: data.sets }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/fitness");
  revalidatePath("/");
  return exercise;
}

export async function deleteExercise(id: string) {
  await db.workoutExercise.delete({ where: { id } });
  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function deleteWorkout(id: string) {
  await db.workout.delete({ where: { id } });
  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function updateWorkout(
  id: string,
  data: { name?: string | null; notes?: string | null; date?: string }
) {
  const workout = await db.workout.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.date && { date: new Date(data.date) }),
    },
  });

  revalidatePath("/fitness");
  revalidatePath("/");
  return workout;
}
