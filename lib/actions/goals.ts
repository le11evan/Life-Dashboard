"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createGoalSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/lib/validations/goals";

export async function getGoals(type?: "short" | "long") {
  const user = await requireUser();
  const where = type ? { userId: user.id, type } : { userId: user.id };
  return db.goal.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getGoalStats() {
  const user = await requireUser();
  const [total, active, completed] = await Promise.all([
    db.goal.count({ where: { userId: user.id } }),
    db.goal.count({ where: { userId: user.id, status: "active" } }),
    db.goal.count({ where: { userId: user.id, status: "completed" } }),
  ]);
  return { total, active, completed };
}

export async function createGoal(input: CreateGoalInput) {
  const user = await requireUser();
  const validated = createGoalSchema.parse(input);

  const goal = await db.goal.create({
    data: {
      userId: user.id,
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
  const user = await requireUser();
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

  const res = await db.goal.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Goal not found");

  revalidatePath("/goals");
  revalidatePath("/");
  return db.goal.findUniqueOrThrow({ where: { id } });
}

export async function deleteGoal(id: string) {
  const user = await requireUser();
  await db.goal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function toggleGoalComplete(id: string) {
  const user = await requireUser();
  const goal = await db.goal.findFirst({ where: { id, userId: user.id } });
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
