"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { apiPost } from "@frontend/lib/api";
import { Card } from "@frontend/components/ui/Card";
import { Button } from "@frontend/components/ui/Button";
import { Badge } from "@frontend/components/ui/Badge";
import { Select } from "@frontend/components/ui/Select";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

interface PlaybookRecommendation {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  impact: "high" | "medium" | "low";
  actionLabel: string;
}

interface PlaybookSummary {
  bestChannel: string | null;
  topRoi: number;
  liveOpportunityScore: number;
  channelsMeasured: number;
  lastMetricAt: string | null;
}

const IMPACT_STYLES = {
  high: "bg-red-500/20 text-red-300",
  medium: "bg-amber-500/20 text-amber-300",
  low: "bg-emerald-500/20 text-emerald-300"
} as const;

export function PlaybookDashboard({
  productId,
  products,
  summary,
  recommendations
}: {
  productId?: string;
  products: ProductOption[];
  summary: PlaybookSummary | null;
  recommendations: PlaybookRecommendation[];
}) {
  const router = useRouter();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const activeProduct = products.find((product) => product.id === productId) ?? products[0];

  async function applyRecommendation(recommendationId: string) {
    if (!productId) return;
    setApplyingId(recommendationId);
    try {
      await apiPost("/playbook", { productId, recommendationId });
      setAppliedIds((current) => [...current, recommendationId]);
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Playbook</h1>
            <p className="mt-2 text-sm text-zinc-400">
              GrowthOS turns live ROI, channel performance, and opportunity data into operating decisions you can apply immediately.
            </p>
          </div>
          {products.length > 0 ? (
              <Select
                value={activeProduct?.id ?? ""}
                onChange={(event) => router.push(`/playbook?productId=${event.target.value}` as Route)}
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
        {activeProduct ? (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Active Product</div>
            <div className="mt-1 text-sm font-medium text-zinc-100">{new URL(activeProduct.url).hostname}</div>
            <p className="mt-1 text-sm text-zinc-400">{activeProduct.description}</p>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Best Channel</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{summary?.bestChannel ?? "—"}</div>
          <p className="mt-1 text-sm text-zinc-400">{summary ? `${summary.topRoi} ROI` : "No ROI data yet."}</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live Intent</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{summary?.liveOpportunityScore ?? 0}</div>
          <p className="mt-1 text-sm text-zinc-400">Highest active opportunity score in the inbox.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Measured Channels</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{summary?.channelsMeasured ?? 0}</div>
          <p className="mt-1 text-sm text-zinc-400">Channels with actual conversion or traffic history.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Playbook Status</div>
          <div className="mt-2 text-sm font-medium text-zinc-100">
            {recommendations.length > 0 ? `${recommendations.length} recommendations ready` : "Waiting for signal"}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {summary?.lastMetricAt ? `Last metric refresh ${new Date(summary.lastMetricAt).toLocaleString()}` : "Refresh metrics and scan In The Wild to generate recommendations."}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card className="text-sm text-zinc-400">
            GrowthOS needs conversion data or live opportunities before it can issue a playbook.
          </Card>
        ) : (
          recommendations.map((recommendation) => {
            const applied = appliedIds.includes(recommendation.id);
            const applying = applyingId === recommendation.id;
            return (
              <Card key={recommendation.id} className="border border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={IMPACT_STYLES[recommendation.impact]}>{recommendation.impact}</Badge>
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Playbook Action</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">{recommendation.title}</h2>
                      <p className="mt-1 text-sm text-zinc-300">{recommendation.summary}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">{recommendation.rationale}</p>
                  </div>
                  <Button
                    disabled={!productId || applied || applying}
                    onClick={() => void applyRecommendation(recommendation.id)}
                  >
                    {applied ? "Applied" : applying ? "Applying…" : recommendation.actionLabel}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
