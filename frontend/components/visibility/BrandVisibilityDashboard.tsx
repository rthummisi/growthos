"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Card } from "@frontend/components/ui/Card";
import { Badge } from "@frontend/components/ui/Badge";
import { Select } from "@frontend/components/ui/Select";
import type { VisibilityResult } from "@shared/types/visibility.types";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

const SENTIMENT_STYLES = {
  positive: "bg-emerald-500/20 text-emerald-300",
  neutral: "bg-zinc-700 text-zinc-300",
  negative: "bg-red-500/20 text-red-300"
} as const;

const INTENT_STYLES = {
  high: "bg-amber-500/20 text-amber-300",
  medium: "bg-violet-500/20 text-violet-300",
  low: "bg-zinc-700 text-zinc-300"
} as const;

const PLAYER_COLORS = [
  "bg-emerald-400",
  "bg-violet-400",
  "bg-amber-400",
  "bg-sky-400"
];

function formatCachedAt(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 2 ? "just now" : `${diff}m ago`;
}

export function BrandVisibilityDashboard({
  productId,
  products,
  visibility
}: {
  productId?: string;
  products: ProductOption[];
  visibility: VisibilityResult;
}) {
  const router = useRouter();
  const activeProduct = products.find((p) => p.id === productId) ?? products[0];

  const playerNames = visibility.shareOfVoice.map((row) => row.name);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Brand Visibility</h1>
              {visibility.cachedAt ? (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  cached {formatCachedAt(visibility.cachedAt)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Track share of voice, earned mentions, sentiment quality, and market conversations around your brand and competitors.
            </p>
          </div>
          {products.length > 0 ? (
            <Select
              value={activeProduct?.id ?? ""}
              onChange={(event) => router.push(`/visibility?productId=${event.target.value}` as Route)}
              className="min-w-72"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {(() => { try { return new URL(p.url).hostname; } catch { return p.url; } })()}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Visibility</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{visibility.summary?.totalMentions ?? 0}</div>
          <p className="mt-1 text-sm text-zinc-400">Total sampled mentions across web, news, and community surfaces.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Share Leader</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{visibility.summary?.shareLeader ?? "—"}</div>
          <p className="mt-1 text-sm text-zinc-400">{visibility.summary?.shareLeaderMentions ?? 0} sampled mentions.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Earned vs Owned</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">
            {visibility.summary ? `${visibility.summary.earnedMentions}/${visibility.summary.ownedMentions}` : "0/0"}
          </div>
          <p className="mt-1 text-sm text-zinc-400">Earned visibility matters more than owned distribution in market awareness.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">High Intent</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{visibility.summary?.highIntentMentions ?? 0}</div>
          <p className="mt-1 text-sm text-zinc-400">Mentions that look like active demand rather than ambient awareness.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Share of Voice</h2>
          <div className="space-y-3">
            {visibility.shareOfVoice.map((row, i) => (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-200">{row.name}</span>
                  <span className="text-zinc-400">{row.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900">
                  <div
                    className={`h-2 rounded-full ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`}
                    style={{ width: `${Math.max(6, row.percentage)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-zinc-500">{row.mentions} mentions</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Visibility Signals</h2>
          <div className="space-y-3">
            {visibility.signals.map((signal) => (
              <div key={signal} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-300">
                {signal}
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Sentiment</div>
              <div className="mt-2 text-sm text-zinc-300">
                {visibility.sentiment.positive} positive · {visibility.sentiment.neutral} neutral · {visibility.sentiment.negative} negative
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Intent Mix</div>
              <div className="mt-2 text-sm text-zinc-300">
                {visibility.intent.high} high · {visibility.intent.medium} medium · {visibility.intent.low} low
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Brand</div>
              <div className="mt-2 text-sm text-zinc-300">{visibility.product?.brandName ?? "—"}</div>
            </div>
          </div>
        </Card>
      </div>

      {visibility.effectiveness.length > 0 ? (
        <Card className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Competitive Effectiveness</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Composite score (0–100) weighted across Share of Voice (35%), Sentiment (30%), Intent Quality (25%), and Earned Ratio (10%).
              Computed from the same equal-depth searches as SOV — no home-field advantage.
            </p>
          </div>
          <div className="space-y-4">
            {visibility.effectiveness.map((entry, i) => (
              <div key={entry.name} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`} />
                    <span className="font-semibold text-zinc-100">{entry.name}</span>
                    {entry.isBrand ? <Badge className="bg-sky-500/20 text-sky-300 text-[10px]">your brand</Badge> : null}
                  </div>
                  <span className="text-2xl font-bold text-zinc-100">{entry.score}<span className="ml-0.5 text-sm font-normal text-zinc-500">/100</span></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900">
                  <div
                    className={`h-1.5 rounded-full ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`}
                    style={{ width: `${entry.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: "Share of Voice", value: `${entry.sovPct}%` },
                    { label: "Sentiment", value: `${entry.sentimentScore}` },
                    { label: "Intent Quality", value: `${entry.intentScore}` },
                    { label: "Earned Ratio", value: `${entry.earnedRatio}%` }
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-zinc-900 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
                      <div className="mt-0.5 text-sm font-semibold text-zinc-200">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {visibility.trend.length > 1 ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Share of Voice Trend</h2>
          <p className="text-sm text-zinc-400">
            SOV % across the last {visibility.trend.length} snapshots — each bar is one refresh.
          </p>
          <div className="space-y-4">
            {playerNames.map((name, colorIdx) => {
              const dataPoints = visibility.trend.map((snap) => {
                const row = snap.shareOfVoice.find((r) => r.name === name);
                return row?.percentage ?? 0;
              });
              const max = Math.max(...dataPoints, 1);
              return (
                <div key={name}>
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]}`} />
                    <span className="font-medium text-zinc-200">{name}</span>
                  </div>
                  <div className="flex h-10 items-end gap-1">
                    {dataPoints.map((pct, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t ${PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]} opacity-80`}
                          style={{ height: `${Math.max(4, (pct / max) * 40)}px` }}
                          title={`${pct}%`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {dataPoints.map((pct, i) => (
                      <div key={i} className="flex-1 text-center text-[10px] text-zinc-600">{pct}%</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Mentions Feed</h2>
        {visibility.mentions.map((mention) => (
          <Card key={mention.url}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{mention.source}</Badge>
                <Badge className={SENTIMENT_STYLES[mention.sentiment]}>{mention.sentiment}</Badge>
                <Badge className={INTENT_STYLES[mention.intent]}>{mention.intent} intent</Badge>
                <Badge className="bg-violet-500/20 text-violet-300">{mention.visibilityScore}/100</Badge>
                {mention.owned
                  ? <Badge className="bg-sky-500/20 text-sky-300">owned</Badge>
                  : <Badge className="bg-emerald-500/20 text-emerald-300">earned</Badge>}
                {mention.competitorName
                  ? <Badge className="bg-amber-500/20 text-amber-300">competitor: {mention.competitorName}</Badge>
                  : null}
              </div>
              <a href={mention.url} target="_blank" rel="noopener noreferrer" className="block font-semibold hover:text-violet-300 hover:underline">
                {mention.title}
              </a>
              <p className="text-sm text-zinc-400">{mention.snippet || "No snippet available."}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
