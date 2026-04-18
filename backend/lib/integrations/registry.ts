import { fetchTraffic } from "@backend/lib/integrations/github";
import * as reddit from "@backend/lib/integrations/reddit";
import * as twitter from "@backend/lib/integrations/twitter";
import * as producthunt from "@backend/lib/integrations/producthunt";
import * as hackernews from "@backend/lib/integrations/hackernews";
import * as npmRegistry from "@backend/lib/integrations/npm";
import * as devto from "@backend/lib/integrations/devto";
import * as hashnode from "@backend/lib/integrations/hashnode";
import * as linkedin from "@backend/lib/integrations/linkedin";
import * as newsletter from "@backend/lib/integrations/newsletter";
import * as stackoverflow from "@backend/lib/integrations/stackoverflow";

function sumMetrics(values: Record<string, unknown>) {
  return Object.values(values).reduce<number>((sum, value) => {
    return typeof value === "number" ? sum + value : sum;
  }, 0);
}

export async function fetchChannelMetricSnapshot(
  channelSlug: string,
  entityId: string
): Promise<{ metricKey: string; metricValue: number; rawData: Record<string, unknown> }> {
  switch (channelSlug) {
    case "github": {
      const metrics = await fetchTraffic(entityId);
      return {
        metricKey: "traffic",
        metricValue: metrics.views + metrics.clones + metrics.stars + metrics.forks,
        rawData: metrics
      };
    }
    case "reddit": {
      const metrics = await reddit.fetchMetrics(entityId);
      return { metricKey: "engagement", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "twitter": {
      const metrics = await twitter.fetchMetrics(entityId);
      return { metricKey: "engagement", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "producthunt": {
      const metrics = await producthunt.fetchMetrics(entityId);
      return { metricKey: "launch", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "hackernews": {
      const metrics = await hackernews.fetchMetrics(entityId);
      return { metricKey: "discussion", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "npm-registry": {
      const metrics = await npmRegistry.fetchMetrics(entityId);
      return { metricKey: "downloads", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "devto": {
      const metrics = await devto.fetchMetrics(entityId);
      return { metricKey: "article", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "hashnode": {
      const metrics = await hashnode.fetchMetrics(entityId);
      return { metricKey: "article", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "linkedin": {
      const metrics = await linkedin.fetchMetrics(entityId);
      return { metricKey: "reach", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "newsletter": {
      const metrics = await newsletter.fetchMetrics(entityId);
      return { metricKey: "newsletter", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    case "stackoverflow": {
      const metrics = await stackoverflow.fetchMetrics(entityId);
      return { metricKey: "answer", metricValue: sumMetrics(metrics), rawData: metrics };
    }
    default: {
      return {
        metricKey: "engagement",
        metricValue: Math.max(5, 100 - channelSlug.length * 3),
        rawData: { source: "growthos-default" }
      };
    }
  }
}
