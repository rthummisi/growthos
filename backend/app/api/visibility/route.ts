import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { buildBrandVisibility } from "@backend/services/visibility.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return json({
      product: null,
      summary: null,
      shareOfVoice: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      intent: { high: 0, medium: 0, low: 0 },
      signals: [],
      mentions: []
    });
  }

  return json(await buildBrandVisibility(productId));
}
