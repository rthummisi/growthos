import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";
import { InTheWildAgent } from "@agents/intelligence/in-the-wild.agent";
import { MarketSignalAgent } from "@agents/intelligence/market-signal.agent";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") ?? "demo-product-1";

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return json({ error: "Product not found" }, 404);
  }

  // Run the In the Wild agent
  const agent = new InTheWildAgent();
  const matches = await agent.run({
    productDescription: product.description,
    icp: product.icp ?? undefined,
    useCases: Array.isArray(product.useCases)
      ? (product.useCases as string[]).join(", ")
      : typeof product.useCases === "string"
      ? product.useCases
      : undefined
  });

  // Persist matches (keep last 50 per product)
  if (matches.length > 0) {
    await prisma.wildMatch.createMany({
      data: matches.map((m) => ({
        productId,
        source: m.source,
        url: m.url,
        title: m.title,
        matchReason: m.matchReason,
        draftReply: m.draftReply
      }))
    });

    // Keep only the 50 most recent
    const all = await prisma.wildMatch.findMany({
      where: { productId },
      orderBy: { fetchedAt: "desc" },
      select: { id: true }
    });
    if (all.length > 50) {
      const toDelete = all.slice(50).map((r) => r.id);
      await prisma.wildMatch.deleteMany({ where: { id: { in: toDelete } } });
    }
  }

  // Run the Market Signal inference pass over last 20 matches
  const recentMatches = await prisma.wildMatch.findMany({
    where: { productId },
    orderBy: { fetchedAt: "desc" },
    take: 20,
    select: { title: true, matchReason: true, source: true }
  });

  const signalAgent = new MarketSignalAgent();
  const signals = await signalAgent.run({
    productDescription: product.description,
    matches: recentMatches
  });

  // Persist signals (keep last 10 per product)
  if (signals.length > 0) {
    await prisma.marketSignal.createMany({
      data: signals.map((s) => ({
        productId,
        insight: s.insight,
        priority: s.priority,
        suggestion: s.suggestion
      }))
    });

    const allSignals = await prisma.marketSignal.findMany({
      where: { productId },
      orderBy: { generatedAt: "desc" },
      select: { id: true }
    });
    if (allSignals.length > 10) {
      const toDelete = allSignals.slice(10).map((r) => r.id);
      await prisma.marketSignal.deleteMany({ where: { id: { in: toDelete } } });
    }
  }

  // Summarise which sources are active so the frontend can show them
  const activeSources = [
    process.env.GITHUB_TOKEN ? "GitHub" : null,
    "Hacker News",
    "Stack Overflow",
    "Reddit",
    "DEV.to",
    "Lobsters",
    process.env.BRAVE_SEARCH_API_KEY ? "Web (Brave)" : null
  ].filter(Boolean);

  return json({ matches, signals, scannedAt: new Date().toISOString(), activeSources });
}
