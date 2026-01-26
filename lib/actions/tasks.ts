"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";

export async function getTasks(filter?: "all" | "today" | "completed") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where = (() => {
    switch (filter) {
      case "today":
        return {
          status: "pending",
          OR: [
            { dueDate: { gte: today, lt: tomorrow } },
            { dueDate: null },
          ],
        };
      case "completed":
        return { status: "completed" };
      default:
        return {};
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pending, completed] = await Promise.all([
    db.task.count({
      where: {
        status: "pending",
        OR: [
          { dueDate: { gte: today, lt: tomorrow } },
          { dueDate: null },
        ],
      },
    }),
    db.task.count({
      where: {
        status: "completed",
        updatedAt: { gte: today, lt: tomorrow },
      },
    }),
  ]);

  return { pending, completed };
}

export async function createTask(input: CreateTaskInput) {
  const validated = createTaskSchema.parse(input);

  const task = await db.task.create({
    data: {
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

  const task = await db.task.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  return task;
}

export async function toggleTaskStatus(id: string) {
  const task = await db.task.findUnique({ where: { id } });
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
  await db.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/");
}
