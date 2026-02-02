"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createGoalSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/lib/validations/goals";

export async function getGoals(type?: "short" | "long") {
  const where = type ? { type } : {};
  return db.goal.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getGoalStats() {
  const [total, active, completed] = await Promise.all([
    db.goal.count(),
    db.goal.count({ where: { status: "active" } }),
    db.goal.count({ where: { status: "completed" } }),
  ]);
  return { total, active, completed };
}

export async function createGoal(input: CreateGoalInput) {
  const validated = createGoalSchema.parse(input);

  const goal = await db.goal.create({
    data: {
      title: validated.title,
      description: validated.description,
      type: validated.type,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/");
  return goal;
}

export async function updateGoal(input: UpdateGoalInput) {
  const validated = updateGoalSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.progress !== undefined) updateData.progress = data.progress;
  if (data.targetDate !== undefined) {
    updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
  }

  const goal = await db.goal.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/goals");
  revalidatePath("/");
  return goal;
}

export async function deleteGoal(id: string) {
  await db.goal.delete({ where: { id } });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function toggleGoalComplete(id: string) {
  const goal = await db.goal.findUnique({ where: { id } });
  if (!goal) throw new Error("Goal not found");

  const newStatus = goal.status === "completed" ? "active" : "completed";
  const newProgress = newStatus === "completed" ? 100 : goal.progress;

  await db.goal.update({
    where: { id },
    data: { status: newStatus, progress: newProgress },
  });

  revalidatePath("/goals");
  revalidatePath("/");
}
