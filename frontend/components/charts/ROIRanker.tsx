"use client";

import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@frontend/components/ui/Card";
import { ScoreBar } from "@frontend/components/ui/ScoreBar";
import { Skeleton } from "@frontend/components/ui/Skeleton";
import { Button } from "@frontend/components/ui/Button";
import { CHANNEL_LABELS, type ChannelSlug } from "@shared/constants/channels";

interface MetricRow {
  channelSlug?: string;
  effectivenessScore?: number;
  metricValue?: number;
  fetchedAt?: string;
}

interface UtmRow {
  channelSlug?: string;
  channelName?: string;
  roi?: number;
  activationRate?: number;
  clickToSignupRate?: number;
}

interface ROIRankerProps {
  metrics: MetricRow[];
  utmRows?: UtmRow[];
  onRefresh?: () => Promise<void>;
  lastUpdated?: string;
}

function buildSparklineData(channelSlug: string, allMetrics: MetricRow[]) {
  const channelMetrics = allMetrics
    .filter((m) => m.channelSlug === channelSlug && m.fetchedAt)
    .sort((a, b) => new Date(a.fetchedAt!).getTime() - new Date(b.fetchedAt!).getTime())
    .slice(-7);

  if (channelMetrics.length < 2) {
    return Array.from({ length: 7 }, (_, i) => ({ v: Math.max(0, (Number(channelMetrics[0]?.effectivenessScore) || 50) - (6 - i) * 2) }));
  }
  return channelMetrics.map((m) => ({ v: Number(m.effectivenessScore ?? 0) }));
}

function trendArrow(data: { v: number }[]): { symbol: string; color: string } {
  if (data.length < 2) return { symbol: "→", color: "text-zinc-400" };
  const delta = data[data.length - 1].v - data[0].v;
  if (delta > 3) return { symbol: "↑", color: "text-emerald-400" };
  if (delta < -3) return { symbol: "↓", color: "text-red-400" };
  return { symbol: "→", color: "text-zinc-400" };
}

export function ROIRanker({ metrics, utmRows = [], onRefresh, lastUpdated }: ROIRankerProps) {
  const [refreshing, setRefreshing] = useState(false);

  const channelMap = new Map<string, number>();
  for (const m of metrics) {
    const slug = m.channelSlug ?? "";
    if (!slug) continue;
    const score = Number(m.effectivenessScore ?? 0);
    if (!channelMap.has(slug) || score > channelMap.get(slug)!) {
      channelMap.set(slug, score);
    }
  }

  const roiRows = utmRows
    .filter((row) => row.channelSlug)
    .map((row) => {
      const channel = row.channelSlug!;
      const roiScore = Number(row.roi ?? 0);
      const activationRate = Number(row.activationRate ?? 0);
      const clickToSignupRate = Number(row.clickToSignupRate ?? 0);
      const fallbackMetricScore = channelMap.get(channel) ?? 0;

      return {
        channel,
        label: row.channelName ?? CHANNEL_LABELS[channel as ChannelSlug] ?? channel,
        roiScore,
        score: Math.max(
          fallbackMetricScore,
          Math.min(100, Math.round(roiScore / 2 + activationRate * 1.5 + clickToSignupRate * 0.5))
        )
      };
    })
    .sort((a, b) => b.roiScore - a.roiScore || b.score - a.score);

  const rows = roiRows.length > 0
    ? roiRows.slice(0, 8)
    : channelMap.size > 0
      ? [...channelMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([channel, score]) => ({
            channel,
            label: CHANNEL_LABELS[channel as ChannelSlug] ?? channel,
            score,
            roiScore: 0
          }))
      : ["github", "hackernews", "reddit", "twitter", "devto"].map((channel, i) => ({
          channel,
          label: CHANNEL_LABELS[channel as ChannelSlug] ?? channel,
          score: 88 - i * 7,
          roiScore: 0
        }));

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Channel ROI Ranker</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-zinc-500">
              Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {onRefresh && (
            <Button variant="ghost" onClick={handleRefresh} disabled={refreshing} className="text-xs px-2 py-1">
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          )}
        </div>
      </div>

      {refreshing ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        rows.map((row) => {
          const sparkData = buildSparklineData(row.channel, metrics);
          const trend = trendArrow(sparkData);
          return (
            <div key={row.channel} className="grid grid-cols-[1fr_80px_24px] items-center gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{row.label}</span>
                  <span className="ml-2 tabular-nums text-zinc-300">
                    {row.roiScore > 0 ? `${row.roiScore} ROI` : row.score}
                  </span>
                </div>
                <ScoreBar value={row.score} />
              </div>

              <ResponsiveContainer width="100%" height={28}>
                <LineChart data={sparkData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 6, fontSize: 11 }}
                    formatter={(val: number) => [`${val}`, "score"]}
                    labelFormatter={() => ""}
                  />
                </LineChart>
              </ResponsiveContainer>

              <span className={`text-base font-bold ${trend.color}`}>{trend.symbol}</span>
            </div>
          );
        })
      )}
    </Card>
  );
}
