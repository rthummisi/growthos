import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";
import { buildWildFeed } from "@backend/lib/demo-data";
import type { ChannelSlug } from "@shared/constants/channels";

type WildMatchRow = {
  id: string;
  source: string;
  url: string;
  title: string;
  matchReason: string;
  draftReply: string;
  fetchedAt: Date | string;
};

function channelFromSource(source: string): ChannelSlug {
  const normalized = source.toLowerCase();
  if (normalized.includes("github")) return "github";
  if (normalized.includes("hacker news")) return "hackernews";
  if (normalized.includes("stack overflow")) return "stackoverflow";
  if (normalized.includes("reddit")) return "reddit";
  if (normalized.includes("dev.to")) return "devto";
  if (normalized.includes("lobsters")) return "lobsters";
  return "twitter";
}

function buildOpportunity(match: WildMatchRow) {
  const sourceWeight =
    match.source.includes("GitHub") ? 18 :
    match.source.includes("Stack Overflow") ? 16 :
    match.source.includes("Reddit") ? 15 :
    match.source.includes("Hacker News") ? 14 :
    match.source.includes("DEV.to") ? 10 :
    9;

  const text = `${match.title} ${match.matchReason}`.toLowerCase();
  const intentBoost =
    /(need|looking for|how do i|how can i|help|recommend|stuck|struggling|faster|automate|tool)/.test(text) ? 22 : 10;
  const urgencyBoost =
    /(today|urgent|asap|now|blocked|deadline|shipping|launch)/.test(text) ? 18 : 8;
  const freshnessHours = Math.max(0, (Date.now() - new Date(match.fetchedAt).getTime()) / 3_600_000);
  const freshnessBoost = freshnessHours < 2 ? 22 : freshnessHours < 8 ? 16 : freshnessHours < 24 ? 10 : 4;
  const opportunityScore = Math.min(100, sourceWeight + intentBoost + urgencyBoost + freshnessBoost);

  const urgency =
    freshnessHours < 2 ? "respond-now" :
    freshnessHours < 12 ? "today" :
    freshnessHours < 36 ? "this-week" :
    "backlog";

  const channelSlug = channelFromSource(match.source);
  return {
    ...match,
    fetchedAt: new Date(match.fetchedAt).toISOString(),
    channelSlug,
    opportunityScore,
    urgency,
    actionType: "reply-draft",
    actionTitle: `Reply to ${match.source}: ${match.title}`,
    actionBody: match.draftReply,
    actionReasoning: `${match.matchReason} Queue this as a high-intent ${channelSlug} reply opportunity while the thread is still active.`
  };
}

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
  const hydratedMatches = (matches.length > 0
    ? matches
    : buildWildFeed().map((item, index) => ({
        id: `demo-wild-${index}`,
        ...item,
        fetchedAt: new Date().toISOString()
      }))).map((match) => buildOpportunity(match as WildMatchRow))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

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
    return json(hydratedMatches);
  }

  return json({
    matches: hydratedMatches,
    signals,
    lastScan,
    activeSources
  });
}
