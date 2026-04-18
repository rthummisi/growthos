import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { generateUtm, trackEvent } from "@backend/lib/utm";
import { computeROIRank } from "@backend/services/metrics.service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    productId: string;
    channelSlug: string;
    suggestionId?: string;
  };
  return json(await generateUtm(body.productId, body.channelSlug, body.suggestionId), 201);
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as {
    utmContent: string;
    event: "click" | "signup" | "activation";
  };
  return json(await trackEvent(body.utmContent, body.event));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  return json(productId ? await computeROIRank(productId) : []);
}
