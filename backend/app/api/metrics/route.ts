import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { fetchChannelMetrics, refreshChannelMetrics } from "@backend/services/metrics.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const channelSlug = searchParams.get("channelSlug") ?? undefined;
  if (!productId) {
    return json([]);
  }
  return json(await fetchChannelMetrics(productId, channelSlug));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { productId: string; channelSlug?: string };
  return json(await refreshChannelMetrics(body.productId, body.channelSlug));
}
