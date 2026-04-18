import { AssetGenerationAgent } from "@agents/asset/asset-generation.agent";
import { ApprovalOrchestrationAgent } from "@agents/approval/approval-orchestration.agent";
import { ChannelDiscoveryAgent } from "@agents/channel/channel-discovery.agent";
import { PlacementStrategyAgent } from "@agents/placement/placement-strategy.agent";
import { ProductUnderstandingAgent } from "@agents/product/product-understanding.agent";
import { ScoringRankingAgent } from "@agents/scoring/scoring-ranking.agent";
import { prisma } from "@backend/lib/prisma";
import { createRun, setRunStatus, updateAgentRun } from "@backend/lib/run-state";
import { publishEvent } from "@backend/lib/events";

const orderedAgents = [
  "product-understanding",
  "channel-discovery",
  "placement-strategy",
  "scoring-ranking",
  "asset-generation",
  "approval-orchestration"
] as const;

async function runStep<T>(runId: string, agentName: string, task: () => Promise<T>) {
  updateAgentRun(runId, agentName, {
    status: "running",
    startedAt: new Date().toISOString()
  });
  publishEvent({ type: "agent:start", agentName, payload: { runId } });
  try {
    const result = await task();
    updateAgentRun(runId, agentName, {
      status: "done",
      completedAt: new Date().toISOString()
    });
    publishEvent({ type: "agent:done", agentName, payload: { runId } });
    return result;
  } catch (error) {
    updateAgentRun(runId, agentName, {
      status: "error",
      completedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "unknown error"
    });
    setRunStatus(runId, "error");
    publishEvent({
      type: "agent:error",
      agentName,
      payload: { runId, error: error instanceof Error ? error.message : "unknown error" }
    });
    throw error;
  }
}

export async function executeRun(productId: string) {
  const runId = `run-${Date.now()}`;
  createRun(runId, productId, [...orderedAgents]);
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  const profile = await runStep(runId, "product-understanding", () =>
    new ProductUnderstandingAgent().run({
      productId: product.id,
      url: product.url,
      githubUrl: product.githubUrl ?? undefined,
      description: product.description
    })
  );

  await prisma.product.update({
    where: { id: product.id },
    data: {
      icp: profile.icp,
      plgWedge: profile.plgWedge,
      useCases: profile.useCases,
      whyDevsShare: profile.whyDevsShare
    }
  });

  const channelScores = await runStep(runId, "channel-discovery", () =>
    new ChannelDiscoveryAgent().run(profile)
  );

  const suggestions = await runStep(runId, "placement-strategy", () =>
    new PlacementStrategyAgent().run({ productProfile: profile, channelScores })
  );

  const ranked = await runStep(runId, "scoring-ranking", () =>
    new ScoringRankingAgent().run(suggestions)
  );

  const assets = await runStep(runId, "asset-generation", () =>
    Promise.all(ranked.map((suggestion) => new AssetGenerationAgent().run(suggestion)))
  );

  await runStep(runId, "approval-orchestration", () =>
    new ApprovalOrchestrationAgent().run({ productId: product.id, suggestions: ranked, assets })
  );

  setRunStatus(runId, "done");
  const pending = await prisma.placementSuggestion.count({ where: { productId, status: "pending" } });
  publishEvent({ type: "queue:update", payload: { pending, productId } });
  return { runId };
}
