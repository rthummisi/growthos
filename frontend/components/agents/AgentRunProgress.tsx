"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@frontend/lib/api";
import { Card } from "@frontend/components/ui/Card";
import { Badge } from "@frontend/components/ui/Badge";

interface RunState {
  status: string;
  startedAt?: string;
  agents?: Array<{ name: string; status: string }>;
}

export function AgentRunProgress() {
  const [run, setRun] = useState<RunState>({ status: "idle" });

  useEffect(() => {
    const load = async () => {
      try {
        setRun(await apiGet<RunState>("/run"));
      } catch {
        setRun({ status: "idle" });
      }
    };
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 5_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Swarm Running</h3>
          <p className="text-sm text-zinc-400">{run.startedAt ?? "No active run"}</p>
        </div>
        <Badge className="bg-violet-500/20 text-violet-300">{run.status}</Badge>
      </div>
      <div className="space-y-3">
        {(run.agents ?? []).map((agent) => (
          <div key={agent.name} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
            <span className="font-mono text-sm">{agent.name}</span>
            <span className="text-sm text-zinc-400">{agent.status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
