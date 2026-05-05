import { CompetitorAgent } from "@agents/intelligence/competitor.agent";
import { ProductUnderstandingAgent } from "@agents/product/product-understanding.agent";
import { firecrawlSearch } from "@agents/_core/scraper";
import { prisma } from "@backend/lib/prisma";
import type { ProductProfile } from "@shared/types/agent.types";
import type { EffectivenessEntry, VisibilityMention, VisibilityResult, VisibilityTrendPoint } from "@shared/types/visibility.types";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const TREND_WINDOW = 7;               // last N snapshots shown in trend

const NEGATIONS = new Set([
  "not", "no", "never", "hardly", "barely",
  "doesnt", "dont", "isnt", "arent", "wasnt", "werent", "cant", "wont", "shouldnt"
]);
const POSITIVE_WORDS = new Set([
  "love", "great", "best", "useful", "helpful", "fast", "excellent",
  "recommend", "favorite", "amazing", "awesome", "perfect", "good"
]);
const NEGATIVE_WORDS = new Set([
  "bad", "broken", "avoid", "hate", "terrible", "spam", "confusing",
  "buggy", "worse", "worst", "awful", "poor", "useless"
]);

function detectSource(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("github.com")) return "GitHub";
    if (hostname.includes("reddit.com")) return "Reddit";
    if (hostname.includes("news.ycombinator.com")) return "Hacker News";
    if (hostname.includes("stackoverflow.com")) return "Stack Overflow";
    if (hostname.includes("dev.to")) return "DEV.to";
    if (hostname.includes("hashnode.com")) return "Hashnode";
    if (hostname.includes("linkedin.com")) return "LinkedIn";
    if (hostname.includes("youtube.com")) return "YouTube";
    return hostname.replace(/^www\./, "");
  } catch {
    return "Web";
  }
}

function domainRoot(input: string) {
  try {
    const hostname = new URL(input).hostname.replace(/^www\./, "");
    const parts = hostname.split(".");
    return parts.length >= 2 ? parts[parts.length - 2] : hostname;
  } catch {
    return input;
  }
}

function classifySentiment(text: string): VisibilityMention["sentiment"] {
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prev = i > 0 ? words[i - 1] : "";
    const negated = NEGATIONS.has(prev);
    if (POSITIVE_WORDS.has(word)) score += negated ? -1 : 1;
    if (NEGATIVE_WORDS.has(word)) score += negated ? 1 : -1;
  }
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

function classifyIntent(text: string): VisibilityMention["intent"] {
  const normalized = text.toLowerCase();
  if (/(looking for|need|recommend|how do i|what should i use|stuck|trying to find|best tool)/.test(normalized)) return "high";
  if (/(comparison|review|alternatives|vs\.?|workflow|stack)/.test(normalized)) return "medium";
  return "low";
}

function scoreMention(source: string, sentiment: VisibilityMention["sentiment"], intent: VisibilityMention["intent"], owned: boolean) {
  const sourceWeight =
    source === "GitHub" ? 24 :
    source === "Hacker News" ? 22 :
    source === "Reddit" ? 20 :
    source === "Stack Overflow" ? 20 :
    source === "DEV.to" ? 16 :
    12;
  const sentimentWeight = sentiment === "positive" ? 18 : sentiment === "negative" ? 8 : 12;
  const intentWeight = intent === "high" ? 30 : intent === "medium" ? 18 : 8;
  const ownershipWeight = owned ? 8 : 18;
  return Math.min(100, sourceWeight + sentimentWeight + intentWeight + ownershipWeight);
}

type SearchResult = { url: string; title: string; description?: string };

function analyseResults(
  results: SearchResult[],
  ownedRoots: string[]
): { positive: number; neutral: number; negative: number; high: number; medium: number; low: number; earned: number; total: number } {
  let positive = 0, neutral = 0, negative = 0, high = 0, medium = 0, low = 0, earned = 0;
  for (const r of results) {
    if (!r.url) continue;
    const text = `${r.title} ${r.description ?? ""}`;
    const s = classifySentiment(text);
    const intent = classifyIntent(text);
    const owned = ownedRoots.some((root) => r.url.toLowerCase().includes(root.toLowerCase()));
    if (s === "positive") positive++; else if (s === "negative") negative++; else neutral++;
    if (intent === "high") high++; else if (intent === "medium") medium++; else low++;
    if (!owned) earned++;
  }
  return { positive, neutral, negative, high, medium, low, earned, total: results.length };
}

function computeEffectiveness(
  name: string,
  isBrand: boolean,
  sovPct: number,
  analysis: ReturnType<typeof analyseResults>
): EffectivenessEntry {
  const { total, positive, negative, high, earned } = analysis;
  const sentimentScore = total === 0 ? 50 : Math.round(((positive - negative * 0.5) / total) * 100);
  const intentScore = total === 0 ? 0 : Math.round((high / total) * 100);
  const earnedRatio = total === 0 ? 100 : Math.round((earned / total) * 100);

  // Weighted composite: SOV 35% · Sentiment 30% · Intent 25% · Earned 10%
  const score = Math.round(
    (sovPct * 0.35) +
    (Math.max(0, sentimentScore) * 0.30) +
    (intentScore * 0.25) +
    (earnedRatio * 0.10)
  );

  return {
    name,
    isBrand,
    score: Math.min(100, Math.max(0, score)),
    sovPct: Number(sovPct.toFixed(1)),
    sentimentScore: Math.min(100, Math.max(0, sentimentScore)),
    intentScore: Math.min(100, Math.max(0, intentScore)),
    earnedRatio: Math.min(100, Math.max(0, earnedRatio))
  };
}

async function buildProductProfile(productId: string) {
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

  return { product, profile };
}

export async function buildBrandVisibility(productId: string): Promise<VisibilityResult> {
  // Return cached snapshot if it is fresh enough
  const cached = await prisma.brandVisibilitySnapshot.findFirst({
    where: { productId },
    orderBy: { snapshotAt: "desc" }
  });

  const trend = await loadTrend(productId);

  if (cached && Date.now() - cached.snapshotAt.getTime() < CACHE_TTL_MS) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    return {
      product: {
        id: product.id,
        url: product.url,
        description: product.description,
        brandName: domainRoot(product.url)
      },
      summary: cached.summary as unknown as VisibilityResult["summary"],
      shareOfVoice: cached.shareOfVoice as unknown as VisibilityResult["shareOfVoice"],
      sentiment: cached.sentiment as unknown as VisibilityResult["sentiment"],
      intent: cached.intent as unknown as VisibilityResult["intent"],
      signals: cached.signals as unknown as string[],
      mentions: cached.mentions as unknown as VisibilityMention[],
      effectiveness: cached.effectiveness as unknown as EffectivenessEntry[] ?? [],
      cachedAt: cached.snapshotAt.toISOString(),
      trend
    };
  }

  const { product, profile } = await buildProductProfile(productId);
  const competitors = await new CompetitorAgent().run({ productProfile: profile });

  const brandName = domainRoot(product.url);
  const competitorNames = competitors.competitors.slice(0, 3).map((entry) => entry.name);
  const categoryQuery = [profile.plgWedge, ...profile.useCases.slice(0, 2)].join(" ");

  // Equal limit (10) for brand and all competitors so SOV is a fair comparison.
  // Category search feeds the mentions feed only — not counted in SOV or effectiveness.
  const [brandResults, categoryResults, ...competitorResults] = await Promise.all([
    firecrawlSearch({ query: `"${brandName}" OR "${product.description.slice(0, 60)}"`, limit: 10, sources: ["web", "news"] }),
    firecrawlSearch({ query: `${categoryQuery} developer tool`, limit: 8, sources: ["web", "news"] }),
    ...competitorNames.map((name) =>
      firecrawlSearch({ query: `"${name}" developer tool`, limit: 10, sources: ["web", "news"] })
    )
  ]);

  const ownedRoots = [domainRoot(product.url), product.githubUrl ? domainRoot(product.githubUrl) : null].filter(Boolean) as string[];
  const mentionMap = new Map<string, VisibilityMention>();

  function addResults(results: SearchResult[], competitorName?: string | null) {
    for (const result of results) {
      if (!result.url) continue;
      const source = detectSource(result.url);
      const snippet = result.description ?? "";
      const text = `${result.title} ${snippet}`;
      const owned = ownedRoots.some((root) => result.url.toLowerCase().includes(root.toLowerCase()));
      const sentiment = classifySentiment(text);
      const intent = classifyIntent(text);
      const visibilityScore = scoreMention(source, sentiment, intent, owned);
      const existing = mentionMap.get(result.url);
      if (!existing || existing.visibilityScore < visibilityScore) {
        mentionMap.set(result.url, { url: result.url, title: result.title, snippet, source, sentiment, intent, visibilityScore, owned, competitorName: competitorName ?? null });
      }
    }
  }

  addResults(brandResults);
  addResults(categoryResults);
  competitorResults.forEach((rows, index) => addResults(rows, competitorNames[index] ?? null));

  const mentions = [...mentionMap.values()]
    .sort((a, b) => b.visibilityScore - a.visibilityScore)
    .slice(0, 20);

  const sentiment = mentions.reduce(
    (acc, m) => { acc[m.sentiment] += 1; return acc; },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const intent = mentions.reduce(
    (acc, m) => { acc[m.intent] += 1; return acc; },
    { high: 0, medium: 0, low: 0 }
  );

  // SOV uses only the dedicated per-entity search counts — equal footing for brand and competitors.
  const shareOfVoice = [
    { name: brandName, mentions: brandResults.length },
    ...competitorNames.map((name, index) => ({ name, mentions: competitorResults[index]?.length ?? 0 }))
  ].sort((a, b) => b.mentions - a.mentions);

  const totalVoice = Math.max(1, shareOfVoice.reduce((sum, row) => sum + row.mentions, 0));
  const ownedMentions = mentions.filter((m) => m.owned).length;
  const earnedMentions = mentions.length - ownedMentions;

  const signals = [
    shareOfVoice[0]?.name !== brandName
      ? `${shareOfVoice[0]?.name} currently leads share of voice in this problem space.`
      : `${brandName} currently leads share of voice in this sampled market view.`,
    intent.high > 0
      ? `${intent.high} high-intent visibility events were detected and should feed into In The Wild or Playbook actions.`
      : "Most current visibility is awareness-level rather than high-intent demand.",
    sentiment.negative > 0
      ? `${sentiment.negative} negative or risk-bearing mentions were detected and need review.`
      : "No major negative visibility spikes were detected in the sampled mentions."
  ];

  const summary = {
    totalMentions: mentions.length,
    earnedMentions,
    ownedMentions,
    shareLeader: shareOfVoice[0]?.name ?? brandName,
    shareLeaderMentions: shareOfVoice[0]?.mentions ?? 0,
    highIntentMentions: intent.high,
    positiveMentions: sentiment.positive,
    negativeMentions: sentiment.negative
  };

  const shareOfVoiceWithPct = shareOfVoice.map((row) => ({
    ...row,
    percentage: Number(((row.mentions / totalVoice) * 100).toFixed(1))
  }));

  // Compute competitive effectiveness scores from each player's raw search results
  const brandAnalysis = analyseResults(brandResults, ownedRoots);
  const brandSovPct = Number(((brandResults.length / totalVoice) * 100).toFixed(1));
  const effectiveness: EffectivenessEntry[] = [
    computeEffectiveness(brandName, true, brandSovPct, brandAnalysis),
    ...competitorNames.map((name, index) => {
      const rows = competitorResults[index] ?? [];
      const sovPct = Number(((rows.length / totalVoice) * 100).toFixed(1));
      // Competitors have no owned roots — all their results are earned from their perspective
      return computeEffectiveness(name, false, sovPct, analyseResults(rows, []));
    })
  ].sort((a, b) => b.score - a.score);

  await prisma.brandVisibilitySnapshot.create({
    data: {
      productId,
      summary: summary as object,
      shareOfVoice: shareOfVoiceWithPct as unknown as object[],
      sentiment: sentiment as object,
      intent: intent as object,
      signals: signals as unknown as object[],
      mentions: mentions as unknown as object[],
      effectiveness: effectiveness as unknown as object[]
    }
  });

  const freshTrend = await loadTrend(productId);

  return {
    product: { id: product.id, url: product.url, description: product.description, brandName },
    summary,
    shareOfVoice: shareOfVoiceWithPct,
    sentiment,
    intent,
    signals,
    mentions,
    effectiveness,
    cachedAt: null,
    trend: freshTrend
  };
}

async function loadTrend(productId: string): Promise<VisibilityTrendPoint[]> {
  const snapshots = await prisma.brandVisibilitySnapshot.findMany({
    where: { productId },
    orderBy: { snapshotAt: "asc" },
    take: TREND_WINDOW,
    select: { snapshotAt: true, shareOfVoice: true }
  });

  return snapshots.map((snap) => ({
    snapshotAt: snap.snapshotAt.toISOString(),
    shareOfVoice: (snap.shareOfVoice as Array<{ name: string; percentage: number }>).map(({ name, percentage }) => ({ name, percentage }))
  }));
}
