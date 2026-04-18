import { prisma } from "@backend/lib/prisma";
import { fetchChannelMetricSnapshot } from "@backend/lib/integrations/registry";
import type { Prisma } from "@prisma/client";
import { writeAuditLog } from "@backend/services/audit.service";

function normalizeMetric(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((value / max) * 100));
}

export async function fetchChannelMetrics(productId: string, channelSlug?: string) {
  const metrics = await prisma.performanceMetric.findMany({
    where: {
      productId,
      channel: channelSlug ? { slug: channelSlug } : undefined
    },
    include: {
      channel: true
    }
  });

  const maxValue = Math.max(1, ...metrics.map((metric) => metric.metricValue));
  return metrics.map((metric) => ({
    id: metric.id,
    channelSlug: metric.channel.slug,
    metricKey: metric.metricKey,
    metricValue: metric.metricValue,
    effectivenessScore: normalizeMetric(metric.metricValue, maxValue),
    fetchedAt: metric.fetchedAt.toISOString()
  }));
}

export async function refreshChannelMetrics(productId: string, channelSlug?: string) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId }
  });
  const channels = await prisma.channel.findMany({
    where: channelSlug ? { slug: channelSlug } : undefined
  });

  if (channels.length === 0) {
    return [];
  }

  for (const channel of channels) {
    const entityId = product.githubUrl ?? product.url;
    const snapshot = await fetchChannelMetricSnapshot(channel.slug, entityId);
    const created = await prisma.performanceMetric.create({
      data: {
        productId,
        channelId: channel.id,
        metricKey: snapshot.metricKey,
        metricValue: snapshot.metricValue,
        rawData: snapshot.rawData as Prisma.InputJsonValue
      }
    });
    await writeAuditLog({
      actor: "system",
      action: "metrics.refreshed",
      entityId: created.id,
      entityType: "PerformanceMetric",
      payload: {
        productId,
        channelSlug: channel.slug
      }
    });
  }

  return fetchChannelMetrics(productId, channelSlug);
}

export async function computeROIRank(productId: string) {
  const rows = await prisma.utmTracking.findMany({
    where: { productId }
  });

  const grouped = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.channelSlug] = (acc[row.channelSlug] ?? 0) + row.signups + row.activations * 2;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([channelSlug, roi]) => ({ channelSlug, roi }))
    .sort((left, right) => right.roi - left.roi);
}
