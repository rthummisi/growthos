import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { prisma } from "@backend/lib/prisma";
import { CHANNEL_LABELS, type ChannelSlug } from "@shared/constants/channels";

function roundRate(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return json([]);

  const rows = await prisma.utmTracking.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" }
  });

  const channelMap = new Map<
    string,
    {
      channelSlug: string;
      channelName: string;
      clicks: number;
      signups: number;
      activations: number;
      lastTouchAt: string;
    }
  >();

  for (const row of rows) {
    const existing = channelMap.get(row.channelSlug) ?? {
      channelSlug: row.channelSlug,
      channelName: CHANNEL_LABELS[row.channelSlug as ChannelSlug] ?? row.channelSlug,
      clicks: 0,
      signups: 0,
      activations: 0,
      lastTouchAt: row.createdAt.toISOString()
    };

    existing.clicks += row.clicks;
    existing.signups += row.signups;
    existing.activations += row.activations;
    if (row.createdAt.toISOString() > existing.lastTouchAt) {
      existing.lastTouchAt = row.createdAt.toISOString();
    }
    channelMap.set(row.channelSlug, existing);
  }

  const report = [...channelMap.values()]
    .map((entry) => {
      const clickToSignupRate = roundRate(entry.signups, entry.clicks);
      const signupToActivationRate = roundRate(entry.activations, entry.signups);
      const activationRate = roundRate(entry.activations, entry.clicks);
      const roi = Math.round(entry.activations * 12 + entry.signups * 4 + entry.clicks * 0.25);

      return {
        ...entry,
        clickToSignupRate,
        signupToActivationRate,
        activationRate,
        roi
      };
    })
    .sort((a, b) => b.roi - a.roi || b.activations - a.activations || b.signups - a.signups);

  return json(report);
}
