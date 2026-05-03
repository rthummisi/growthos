import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";
import { buildWildFeed } from "@backend/lib/demo-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") ?? "demo-product-1";
  const detailed = searchParams.get("detailed") === "1";

  const [matches, signals] = await Promise.all([
    prisma.wildMatch.findMany({
      where: { productId },
      orderBy: { fetchedAt: "desc" },
      take: 20
    }),
    prisma.marketSignal.findMany({
      where: { productId },
      orderBy: { generatedAt: "desc" },
      take: 5
    })
  ]);

  const lastScan = matches[0]?.fetchedAt ?? null;

  const activeSources = [
    process.env.GITHUB_TOKEN ? "GitHub" : null,
    "Hacker News",
    "Stack Overflow",
    "Reddit",
    "DEV.to",
    "Lobsters",
    process.env.FIRECRAWL_API_KEY && process.env.TAVILY_API_KEY
      ? "Web (Firecrawl + Tavily fallback)"
      : process.env.FIRECRAWL_API_KEY
        ? "Web (Firecrawl)"
        : process.env.TAVILY_API_KEY
          ? "Web (Tavily)"
          : null
  ].filter(Boolean);

  if (!detailed) {
    return json(
      matches.length > 0
        ? matches
        : buildWildFeed().map((item, index) => ({
            id: `demo-wild-${index}`,
            ...item,
            fetchedAt: new Date().toISOString()
          }))
    );
  }

  return json({
    matches:
      matches.length > 0
        ? matches
        : buildWildFeed().map((item, index) => ({
            id: `demo-wild-${index}`,
            ...item,
            fetchedAt: new Date().toISOString()
          })),
    signals,
    lastScan,
    activeSources
  });
}
