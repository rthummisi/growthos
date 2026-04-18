import { NextRequest } from "next/server";
import { bootWorkers } from "@backend/lib/workers";
import { prisma } from "@backend/lib/prisma";
import { json, auditMutation } from "@backend/lib/api";
import { enqueueExecutionTask } from "@backend/services/execution.service";

export async function POST(request: NextRequest) {
  bootWorkers();
  const body = (await request.json()) as { suggestionId: string };
  const task = await enqueueExecutionTask(body.suggestionId);
  await auditMutation("execution.created", "ExecutionTask", task);
  return json(task, 201);
}

export async function GET() {
  const tasks = await prisma.executionTask.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return json(tasks);
}
