"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Card } from "@frontend/components/ui/Card";
import { Badge } from "@frontend/components/ui/Badge";
import { Select } from "@frontend/components/ui/Select";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

interface VisibilityMention {
  url: string;
  title: string;
  snippet: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  intent: "high" | "medium" | "low";
  visibilityScore: number;
  owned: boolean;
  competitorName?: string | null;
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

export function BrandVisibilityDashboard({
  productId,
  products,
  visibility
}: {
  productId?: string;
  products: ProductOption[];
  visibility: {
    product: { brandName: string } | null;
    summary: {
      totalMentions: number;
      earnedMentions: number;
      ownedMentions: number;
      shareLeader: string;
      shareLeaderMentions: number;
      highIntentMentions: number;
      positiveMentions: number;
      negativeMentions: number;
    } | null;
    shareOfVoice: Array<{ name: string; mentions: number; percentage: number }>;
    sentiment: { positive: number; neutral: number; negative: number };
    intent: { high: number; medium: number; low: number };
    signals: string[];
    mentions: VisibilityMention[];
  };
}) {
  const router = useRouter();
  const activeProduct = products.find((product) => product.id === productId) ?? products[0];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Brand Visibility</h1>
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
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {new URL(product.url).hostname}
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
            {visibility.shareOfVoice.map((row) => (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-200">{row.name}</span>
                  <span className="text-zinc-400">{row.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
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
                {mention.owned ? <Badge className="bg-sky-500/20 text-sky-300">owned</Badge> : <Badge className="bg-emerald-500/20 text-emerald-300">earned</Badge>}
                {mention.competitorName ? <Badge className="bg-amber-500/20 text-amber-300">competitor: {mention.competitorName}</Badge> : null}
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
