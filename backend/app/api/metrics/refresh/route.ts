import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { refreshChannelMetrics } from "@backend/services/metrics.service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { productId: string; channelSlug?: string };
  return json(await refreshChannelMetrics(body.productId, body.channelSlug));
}
