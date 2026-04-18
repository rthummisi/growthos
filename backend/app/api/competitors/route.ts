import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";
import { ProductUnderstandingAgent } from "@agents/product/product-understanding.agent";
import { CompetitorAgent } from "@agents/intelligence/competitor.agent";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return json({ competitors: [], gaps: [] });
  }

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const profile = await new ProductUnderstandingAgent().run({
    productId: product.id,
    url: product.url,
    githubUrl: product.githubUrl ?? undefined,
    description: product.description
  });
  return json(await new CompetitorAgent().run({ productProfile: profile }));
}
