"use client";

import { Card } from "@frontend/components/ui/Card";
import { ScoreBar } from "@frontend/components/ui/ScoreBar";
import { Badge } from "@frontend/components/ui/Badge";

interface MetricRow {
  channelSlug?: string;
  effectivenessScore?: number;
  metricKey?: string;
  metricValue?: number;
  fetchedAt?: string;
}

interface ChannelEffectivenessGridProps {
  metrics: MetricRow[];
  selectedChannel?: string;
  onChannelSelect?: (channel: string | undefined) => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ChannelEffectivenessGrid({
  metrics,
  selectedChannel,
  onChannelSelect
}: ChannelEffectivenessGridProps) {
  const channelMap = new Map<
    string,
    { score: number; metricKey: string; metricValue: number; fetchedAt: string }
  >();

  for (const m of metrics) {
    const slug = m.channelSlug ?? "";
    if (!slug) continue;
    if (!channelMap.has(slug)) {
      channelMap.set(slug, {
        score: Number(m.effectivenessScore ?? 0),
        metricKey: String(m.metricKey ?? "score"),
        metricValue: Number(m.metricValue ?? 0),
        fetchedAt: String(m.fetchedAt ?? new Date().toISOString())
      });
    }
  }

  const rows =
    channelMap.size > 0
      ? [...channelMap.entries()].map(([slug, data]) => ({ slug, ...data }))
      : [
          { slug: "github", score: 0, metricKey: "stars", metricValue: 0, fetchedAt: new Date().toISOString() },
          { slug: "hackernews", score: 0, metricKey: "points", metricValue: 0, fetchedAt: new Date().toISOString() },
          { slug: "reddit", score: 0, metricKey: "upvotes", metricValue: 0, fetchedAt: new Date().toISOString() }
        ];

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Per-Channel Effectiveness</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map((row) => {
          const isSelected = selectedChannel === row.slug;
          return (
            <Card
              key={row.slug}
              className={`cursor-pointer transition-colors ${isSelected ? "ring-1 ring-violet-500" : "hover:border-zinc-700"}`}
              onClick={() => onChannelSelect?.(isSelected ? undefined : row.slug)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize">{row.slug}</h3>
                <Badge className="bg-zinc-800 text-zinc-300 text-xs">{row.score}/100</Badge>
              </div>
              <ScoreBar value={row.score} className="mt-2" />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {row.metricKey}: {row.metricValue.toLocaleString()}
                </span>
                <span>{relativeTime(row.fetchedAt)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
