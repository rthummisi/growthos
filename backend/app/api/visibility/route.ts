import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { buildBrandVisibility } from "@backend/services/visibility.service";
import { buildDemoVisibility } from "@backend/lib/demo-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return json(buildDemoVisibility());
  return json(await buildBrandVisibility(productId));
}
