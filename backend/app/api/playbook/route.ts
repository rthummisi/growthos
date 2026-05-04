import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { applyPlaybookRecommendation, buildPlaybook } from "@backend/services/playbook.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return json({ summary: null, recommendations: [], product: null });
  }
  return json(await buildPlaybook(productId));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { productId: string; recommendationId: string };
  return json(await applyPlaybookRecommendation(body.productId, body.recommendationId), 201);
}
