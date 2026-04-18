import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { prisma } from "@backend/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return json([]);

  const rows = await prisma.utmTracking.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" }
  });

  const channelMap = new Map<string, { channelSlug: string; clicks: number; signups: number; activations: number }>();
  for (const row of rows) {
    const existing = channelMap.get(row.channelSlug) ?? { channelSlug: row.channelSlug, clicks: 0, signups: 0, activations: 0 };
    existing.clicks += row.clicks;
    existing.signups += row.signups;
    existing.activations += row.activations;
    channelMap.set(row.channelSlug, existing);
  }

  return json([...channelMap.values()]);
}
