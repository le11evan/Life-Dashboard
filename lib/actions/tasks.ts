"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStartOfDayLA } from "@/lib/utils";
import { requireUser } from "@/lib/session";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";

export async function getTasks(filter?: "all" | "today" | "completed") {
  const user = await requireUser();
  const today = getStartOfDayLA();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const scope = { userId: user.id };
  const where = (() => {
    switch (filter) {
      case "today":
        return {
          ...scope,
          status: "pending",
          OR: [
            { dueDate: { gte: today, lt: tomorrow } },
            { dueDate: null },
          ],
        };
      case "completed":
        return { ...scope, status: "completed" };
      default:
        return scope;
    }
  })();

  return db.task.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getTodayTasksCount() {
  const user = await requireUser();
  const today = getStartOfDayLA();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pending, completed] = await Promise.all([
    db.task.count({
      where: {
        userId: user.id,
        status: "pending",
        OR: [
          { dueDate: { gte: today, lt: tomorrow } },
          { dueDate: null },
        ],
      },
    }),
    db.task.count({
      where: {
        userId: user.id,
        status: "completed",
        updatedAt: { gte: today, lt: tomorrow },
      },
    }),
  ]);

  return { pending, completed };
}

export async function createTask(input: CreateTaskInput) {
  const user = await requireUser();
  const validated = createTaskSchema.parse(input);

  const task = await db.task.create({
    data: {
      userId: user.id,
      title: validated.title,
      notes: validated.notes,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      priority: validated.priority,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  return task;
}

export async function updateTask(input: UpdateTaskInput) {
  const user = await requireUser();
  const validated = updateTaskSchema.parse(input);
  const { id, ...data } = validated;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  const res = await db.task.updateMany({
    where: { id, userId: user.id },
    data: updateData,
  });
  if (res.count === 0) throw new Error("Task not found");

  revalidatePath("/tasks");
  revalidatePath("/");
  return db.task.findUniqueOrThrow({ where: { id } });
}

export async function toggleTaskStatus(id: string) {
  const user = await requireUser();
  const task = await db.task.findFirst({ where: { id, userId: user.id } });
  if (!task) throw new Error("Task not found");

  const updated = await db.task.update({
    where: { id },
    data: {
      status: task.status === "pending" ? "completed" : "pending",
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  return updated;
}

export async function deleteTask(id: string) {
  const user = await requireUser();
  await db.task.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/tasks");
  revalidatePath("/");
}
