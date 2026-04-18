export interface AgentRunState {
  runId: string;
  productId: string;
  startedAt: string;
  status: "idle" | "running" | "done" | "error";
  agents: Array<{
    name: string;
    status: "waiting" | "running" | "done" | "error";
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
}

const runs = new Map<string, AgentRunState>();

export function createRun(runId: string, productId: string, agentNames: string[]) {
  const run: AgentRunState = {
    runId,
    productId,
    startedAt: new Date().toISOString(),
    status: "running",
    agents: agentNames.map((name) => ({ name, status: "waiting" }))
  };
  runs.set(runId, run);
  return run;
}

export function updateAgentRun(
  runId: string,
  agentName: string,
  patch: Partial<AgentRunState["agents"][number]>
) {
  const run = runs.get(runId);
  if (!run) {
    return;
  }
  run.agents = run.agents.map((agent) =>
    agent.name === agentName ? { ...agent, ...patch } : agent
  );
}

export function setRunStatus(runId: string, status: AgentRunState["status"]) {
  const run = runs.get(runId);
  if (!run) {
    return;
  }
  run.status = status;
}

export function getRun(runId?: string) {
  if (runId) {
    return runs.get(runId) ?? null;
  }
  return [...runs.values()].at(-1) ?? null;
}
