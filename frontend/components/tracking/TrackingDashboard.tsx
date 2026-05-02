"use client";

import { useState } from "react";
import { apiGet, apiPost } from "@frontend/lib/api";
import { ROIRanker } from "@frontend/components/charts/ROIRanker";
import { FunnelChart } from "@frontend/components/charts/FunnelChart";
import { ChannelEffectivenessGrid } from "@frontend/components/charts/ChannelEffectivenessGrid";
import { Card } from "@frontend/components/ui/Card";

interface UtmRow {
  channelSlug?: string;
  channelName?: string;
  clicks?: number;
  signups?: number;
  activations?: number;
  clickToSignupRate?: number;
  signupToActivationRate?: number;
  activationRate?: number;
  roi?: number;
  lastTouchAt?: string;
}

interface MetricRow {
  channelSlug?: string;
  metricKey?: string;
  metricValue?: number;
  effectivenessScore?: number;
  fetchedAt?: string;
  rawData?: Record<string, unknown>;
}

export function TrackingDashboard({
  productId,
  initialMetrics,
  initialUtm = []
}: {
  productId?: string;
  initialMetrics: MetricRow[];
  initialUtm?: UtmRow[];
}) {
  const [metrics, setMetrics] = useState<MetricRow[]>(initialMetrics);
  const [utmData, setUtmData] = useState<UtmRow[]>(initialUtm);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>();

  async function refreshMetrics() {
    if (!productId) return;
    const [nextMetrics, nextUtm] = await Promise.all([
      apiPost<MetricRow[]>("/metrics/refresh", { productId }),
      apiGet<UtmRow[]>(`/utm/report?productId=${productId}`)
    ]);
    setMetrics(nextMetrics);
    setUtmData(nextUtm);
    setLastUpdated(new Date().toISOString());
  }

  const filteredUtm = selectedChannel
    ? utmData.filter((row) => row.channelSlug === selectedChannel)
    : utmData;
  const totalClicks = filteredUtm.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const totalSignups = filteredUtm.reduce((sum, row) => sum + (row.signups ?? 0), 0);
  const totalActivations = filteredUtm.reduce((sum, row) => sum + (row.activations ?? 0), 0);
  const totalRoi = filteredUtm.reduce((sum, row) => sum + (row.roi ?? 0), 0);
  const bestChannel = [...utmData].sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">ROI Engine</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{totalRoi}</div>
          <p className="mt-1 text-sm text-zinc-400">Weighted outcome score across approved placements.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Best Channel</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{bestChannel?.channelName ?? "—"}</div>
          <p className="mt-1 text-sm text-zinc-400">
            {bestChannel ? `${bestChannel.roi ?? 0} ROI · ${bestChannel.activationRate?.toFixed(1) ?? "0.0"}% activation rate` : "No channel has converted yet."}
          </p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pipeline</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100">{totalSignups}</div>
          <p className="mt-1 text-sm text-zinc-400">{totalClicks} clicks converted into {totalActivations} activations.</p>
        </Card>
        <Card className="bg-zinc-950/70">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recommendation</div>
          <div className="mt-2 text-sm font-medium text-zinc-100">
            {bestChannel ? `Double down on ${bestChannel.channelName}.` : "Approve and ship placements to start learning."}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {bestChannel
              ? `It is currently your highest-yield channel by ROI and activation efficiency.`
              : "The closed loop needs at least one approved placement with UTM traffic."}
          </p>
        </Card>
      </div>

      <ROIRanker
        metrics={metrics}
        utmRows={utmData}
        onRefresh={refreshMetrics}
        lastUpdated={lastUpdated}
      />

      <FunnelChart
        utmData={utmData}
        selectedChannel={selectedChannel}
      />

      <ChannelEffectivenessGrid
        metrics={metrics}
        utmRows={utmData}
        onChannelSelect={setSelectedChannel}
        selectedChannel={selectedChannel}
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-lg font-semibold">Short-Form Video Metrics</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          {(() => {
            const focused =
              metrics.find(
                (metric) =>
                  metric.channelSlug === (selectedChannel ?? metric.channelSlug) &&
                  (metric.channelSlug === "youtube-shorts" || metric.channelSlug === "instagram-reels")
              ) ??
              metrics.find(
                (metric) => metric.channelSlug === "youtube-shorts" || metric.channelSlug === "instagram-reels"
              );

            const raw = focused?.rawData ?? {};
            const items: Array<[string, unknown]> = [
              ["Views", raw.views],
              ["Avg View", raw.avgViewDuration],
              ["Completion", raw.completionRate],
              ["Shares", raw.shares],
              ["Saves / Subs", raw.saves ?? raw.subscribersGained]
            ];

            return items.map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-zinc-950 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
                <div className="mt-2 text-lg font-semibold text-zinc-100">
                  {typeof value === "number"
                    ? label === "Completion"
                      ? `${(value * 100).toFixed(1)}%`
                      : value.toLocaleString()
                    : "—"}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
