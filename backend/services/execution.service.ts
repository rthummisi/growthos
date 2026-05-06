import { ExecutionAgent } from "@agents/execution/execution.agent";
import { executionQueue } from "@backend/lib/queue";
import { prisma } from "@backend/lib/prisma";
import type { AssetOutput } from "@shared/types/agent.types";

export async function enqueueExecutionTask(suggestionId: string) {
  const approval = await prisma.approval.findFirst({
    where: {
      suggestionId,
      decision: "approved"
    },
    orderBy: { decidedAt: "desc" }
  });

  if (!approval) {
    throw new Error("Suggestion must be approved before execution");
  }

  const task = await prisma.executionTask.create({
    data: {
      suggestionId,
      status: "queued"
    }
  });

  await executionQueue.add(`execution:${task.id}`, {
    taskId: task.id,
    suggestionId
  });

  return task;
}

export async function processExecutionTask(input: { taskId: string; suggestionId: string }) {
  const asset = await prisma.asset.findFirstOrThrow({
    where: { suggestionId: input.suggestionId },
    orderBy: { createdAt: "asc" }
  });

  return new ExecutionAgent().run({
    taskId: input.taskId,
    suggestionId: input.suggestionId,
    approvedAsset: {
      suggestionId: input.suggestionId,
      type: asset.type as AssetOutput["type"],
      title: asset.title,
      content: asset.content,
      variations: []
    }
  });
}
