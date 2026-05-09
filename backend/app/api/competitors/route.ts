import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";
import { ProductUnderstandingAgent } from "@agents/product/product-understanding.agent";
import { CompetitorAgent } from "@agents/intelligence/competitor.agent";
import type { ProductProfile } from "@shared/types/agent.types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return json({ competitors: [], gaps: [] });
  }

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const profile: ProductProfile =
    product.icp && product.plgWedge && Array.isArray(product.useCases)
      ? {
          productId: product.id,
          icp: product.icp,
          plgWedge: product.plgWedge,
          useCases: product.useCases as string[],
          whyDevsShare: product.whyDevsShare ?? "A fast, concrete workflow demo makes the product easy to share.",
          technicalSurface: ["API", "CLI", "docs", "repository", "sample workflows"],
          targetCommunities: ["GitHub", "Hacker News", "Reddit", "YouTube Shorts", "Instagram Reels"]
        }
      : await new ProductUnderstandingAgent().run({
          productId: product.id,
          url: product.url,
          githubUrl: product.githubUrl ?? undefined,
          description: product.description
        });
  return json(await new CompetitorAgent().run({ productProfile: profile }));
}
