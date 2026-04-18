"use client";

import { useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@frontend/components/ui/Card";

interface UtmRow {
  channelSlug?: string;
  clicks?: number;
  signups?: number;
  activations?: number;
}

interface FunnelChartProps {
  utmData: UtmRow[];
  selectedChannel?: string;
}

const FUNNEL_STEPS = [
  { key: "clicks", label: "Clicks", color: "#8b5cf6" },
  { key: "signups", label: "Signups", color: "#6d28d9" },
  { key: "activations", label: "Activations", color: "#4c1d95" },
  { key: "retention", label: "Retained", color: "#2e1065" }
];

export function FunnelChart({ utmData, selectedChannel }: FunnelChartProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const filtered = selectedChannel
    ? utmData.filter((r) => r.channelSlug === selectedChannel)
    : utmData;

  const clicks = filtered.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const signups = filtered.reduce((s, r) => s + (r.signups ?? 0), 0);
  const activations = filtered.reduce((s, r) => s + (r.activations ?? 0), 0);
  const retention = Math.round(activations * 0.6);

  const data = [
    { name: "Clicks", value: clicks },
    { name: "Signups", value: signups },
    { name: "Activations", value: activations },
    { name: "Retained", value: retention }
  ];

  const maxVal = Math.max(clicks, 1);

  function convRate(num: number, denom: number) {
    if (!denom) return "—";
    return `${((num / denom) * 100).toFixed(1)}%`;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversion Funnel</h2>
        {selectedChannel && (
          <span className="rounded-full bg-violet-900/40 px-2 py-0.5 text-xs text-violet-300">{selectedChannel}</span>
        )}
      </div>

      {clicks === 0 ? (
        <p className="text-sm text-zinc-500">No UTM data yet. Approve and execute placements to start tracking.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, maxVal]} hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 6, fontSize: 12 }}
                formatter={(val: number) => [val.toLocaleString(), ""]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} onMouseEnter={(_, i) => setHoveredStep(FUNNEL_STEPS[i]?.key ?? null)} onMouseLeave={() => setHoveredStep(null)}>
                {data.map((_, i) => (
                  <Cell
                    key={FUNNEL_STEPS[i]?.key}
                    fill={FUNNEL_STEPS[i]?.color}
                    opacity={hoveredStep === null || hoveredStep === FUNNEL_STEPS[i]?.key ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg bg-zinc-900 p-2">
              <div className="text-zinc-400">Clicks</div>
              <div className="text-base font-semibold text-zinc-100">{clicks.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-zinc-900 p-2">
              <div className="text-zinc-400">Signups</div>
              <div className="text-base font-semibold text-zinc-100">{signups.toLocaleString()}</div>
              <div className="text-zinc-500">{convRate(signups, clicks)}</div>
            </div>
            <div className="rounded-lg bg-zinc-900 p-2">
              <div className="text-zinc-400">Activations</div>
              <div className="text-base font-semibold text-zinc-100">{activations.toLocaleString()}</div>
              <div className="text-zinc-500">{convRate(activations, signups)}</div>
            </div>
            <div className="rounded-lg bg-zinc-900 p-2">
              <div className="text-zinc-400">Retained</div>
              <div className="text-base font-semibold text-zinc-100">{retention.toLocaleString()}</div>
              <div className="text-zinc-500">{convRate(retention, activations)}</div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
