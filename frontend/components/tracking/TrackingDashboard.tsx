"use client";

import { useState } from "react";
import { apiGet, apiPost } from "@frontend/lib/api";
import { ROIRanker } from "@frontend/components/charts/ROIRanker";
import { FunnelChart } from "@frontend/components/charts/FunnelChart";
import { ChannelEffectivenessGrid } from "@frontend/components/charts/ChannelEffectivenessGrid";

interface UtmRow {
  channelSlug?: string;
  clicks?: number;
  signups?: number;
  activations?: number;
}

export function TrackingDashboard({
  productId,
  initialMetrics,
  initialUtm = []
}: {
  productId?: string;
  initialMetrics: Array<Record<string, unknown>>;
  initialUtm?: UtmRow[];
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [utmData, setUtmData] = useState<UtmRow[]>(initialUtm);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>();

  async function refreshMetrics() {
    if (!productId) return;
    const [nextMetrics, nextUtm] = await Promise.all([
      apiPost<Array<Record<string, unknown>>>("/metrics/refresh", { productId }),
      apiGet<UtmRow[]>(`/utm/report?productId=${productId}`)
    ]);
    setMetrics(nextMetrics);
    setUtmData(nextUtm);
    setLastUpdated(new Date().toISOString());
  }

  return (
    <div className="space-y-6">
      <ROIRanker
        metrics={metrics}
        onRefresh={refreshMetrics}
        lastUpdated={lastUpdated}
      />

      <FunnelChart
        utmData={utmData}
        selectedChannel={selectedChannel}
      />

      <ChannelEffectivenessGrid
        metrics={metrics}
        onChannelSelect={setSelectedChannel}
        selectedChannel={selectedChannel}
      />
    </div>
  );
}
