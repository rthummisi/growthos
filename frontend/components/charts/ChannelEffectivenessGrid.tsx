"use client";

import { Card } from "@frontend/components/ui/Card";
import { ScoreBar } from "@frontend/components/ui/ScoreBar";
import { Badge } from "@frontend/components/ui/Badge";
import { CHANNEL_LABELS, type ChannelSlug } from "@shared/constants/channels";

interface MetricRow {
  channelSlug?: string;
  effectivenessScore?: number;
  metricKey?: string;
  metricValue?: number;
  fetchedAt?: string;
}

interface UtmRow {
  channelSlug?: string;
  roi?: number;
  activationRate?: number;
  clickToSignupRate?: number;
  channelName?: string;
}

interface ChannelEffectivenessGridProps {
  metrics: MetricRow[];
  utmRows?: UtmRow[];
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
  utmRows = [],
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

  const utmMap = new Map(utmRows.filter((row) => row.channelSlug).map((row) => [row.channelSlug!, row]));

  const rows = (
    channelMap.size > 0
      ? [...channelMap.entries()].map(([slug, data]) => ({ slug, ...data }))
      : [
          { slug: "github", score: 0, metricKey: "stars", metricValue: 0, fetchedAt: new Date().toISOString() },
          { slug: "hackernews", score: 0, metricKey: "points", metricValue: 0, fetchedAt: new Date().toISOString() },
          { slug: "reddit", score: 0, metricKey: "upvotes", metricValue: 0, fetchedAt: new Date().toISOString() }
        ]
  ).map((row) => ({
    ...row,
    utm: utmMap.get(row.slug)
  }));

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
                <h3 className="font-semibold">{row.utm?.channelName ?? CHANNEL_LABELS[row.slug as ChannelSlug] ?? row.slug}</h3>
                <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                  {row.utm?.roi ? `${row.utm.roi} ROI` : `${row.score}/100`}
                </Badge>
              </div>
              <ScoreBar value={row.score} className="mt-2" />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {row.metricKey}: {row.metricValue.toLocaleString()}
                </span>
                <span>{relativeTime(row.fetchedAt)}</span>
              </div>
              {row.utm ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <div className="rounded-lg bg-zinc-950 px-3 py-2">
                    Signup rate {row.utm.clickToSignupRate?.toFixed(1) ?? "0.0"}%
                  </div>
                  <div className="rounded-lg bg-zinc-950 px-3 py-2">
                    Activation rate {row.utm.activationRate?.toFixed(1) ?? "0.0"}%
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
