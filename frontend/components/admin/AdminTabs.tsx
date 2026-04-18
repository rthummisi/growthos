"use client";

import { useState } from "react";
import { AgentRunProgress } from "@frontend/components/agents/AgentRunProgress";
import { Tabs } from "@frontend/components/ui/Tabs";

export function AdminTabs({
  system
}: {
  system: {
    postgres: boolean;
    redis: boolean;
    minio: boolean;
    env: Record<string, boolean>;
  };
}) {
  const [active, setActive] = useState("Agents");

  return (
    <div className="space-y-6">
      <Tabs tabs={["Agents", "Scheduler", "System"]} active={active} onChange={setActive} />
      {active === "Agents" ? <AgentRunProgress /> : null}
      {active === "Scheduler" ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 p-4">Per-channel cadence controls live in Scheduler.</div>
          <div className="rounded-xl border border-zinc-800 p-4">Queue-backed jobs are registered locally.</div>
          <div className="rounded-xl border border-zinc-800 p-4">Approval queue populates from scheduled runs.</div>
        </div>
      ) : null}
      {active === "System" ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 p-4">Postgres: {system.postgres ? "connected" : "down"}</div>
          <div className="rounded-xl border border-zinc-800 p-4">Redis: {system.redis ? "connected" : "down"}</div>
          <div className="rounded-xl border border-zinc-800 p-4">MinIO: {system.minio ? "connected" : "down"}</div>
          {Object.entries(system.env).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-zinc-800 p-4">
              {key}: {value ? "present" : "missing"}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
