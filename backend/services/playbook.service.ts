import { prisma } from "@backend/lib/prisma";
import { publishEvent } from "@backend/lib/events";
import { updateChannelSchedule } from "@backend/services/scheduler.service";
import { auditMutation } from "@backend/lib/api";
import { CHANNEL_LABELS, type ChannelSlug } from "@shared/constants/channels";

type ImpactLevel = "high" | "medium" | "low";

interface RecommendationAction {
  kind: "update-cadence" | "queue-opportunity";
  channelSlug?: string;
  cadence?: string;
  active?: boolean;
  matchId?: string;
}

export interface PlaybookRecommendation {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  impact: ImpactLevel;
  actionLabel: string;
  action: RecommendationAction;
}

function impactClass(value: number): ImpactLevel {
  if (value >= 80) return "high";
  if (value >= 55) return "medium";
  return "low";
}

function scoreOpportunity(match: { source: string; title: string; matchReason: string; fetchedAt: Date }) {
  const text = `${match.title} ${match.matchReason}`.toLowerCase();
  const sourceWeight =
    match.source.includes("GitHub") ? 22 :
    match.source.includes("Stack Overflow") ? 20 :
    match.source.includes("Reddit") ? 18 :
    match.source.includes("Hacker News") ? 17 :
    12;
  const intentBoost = /(need|looking for|how do i|stuck|automate|faster|recommend|help)/.test(text) ? 35 : 18;
  const freshnessHours = Math.max(0, (Date.now() - match.fetchedAt.getTime()) / 3_600_000);
  const freshnessBoost = freshnessHours < 2 ? 30 : freshnessHours < 12 ? 20 : freshnessHours < 24 ? 12 : 5;
  return Math.min(100, sourceWeight + intentBoost + freshnessBoost);
}

function sourceToChannel(source: string): ChannelSlug {
  const normalized = source.toLowerCase();
  if (normalized.includes("github")) return "github";
  if (normalized.includes("stack overflow")) return "stackoverflow";
  if (normalized.includes("hacker news")) return "hackernews";
  if (normalized.includes("reddit")) return "reddit";
  if (normalized.includes("dev.to")) return "devto";
  if (normalized.includes("lobsters")) return "lobsters";
  return "twitter";
}

export async function buildPlaybook(productId: string) {
  const [product, channels, utmRows, metrics, matches] = await Promise.all([
    prisma.product.findUniqueOrThrow({ where: { id: productId } }),
    prisma.channel.findMany({ orderBy: { name: "asc" } }),
    prisma.utmTracking.findMany({ where: { productId }, orderBy: { createdAt: "desc" } }),
    prisma.performanceMetric.findMany({
      where: { productId },
      include: { channel: true },
      orderBy: { fetchedAt: "desc" }
    }),
    prisma.wildMatch.findMany({
      where: { productId },
      orderBy: { fetchedAt: "desc" },
      take: 10
    })
  ]);

  const channelPerformance = new Map<string, { clicks: number; signups: number; activations: number; roi: number }>();
  for (const row of utmRows) {
    const current = channelPerformance.get(row.channelSlug) ?? { clicks: 0, signups: 0, activations: 0, roi: 0 };
    current.clicks += row.clicks;
    current.signups += row.signups;
    current.activations += row.activations;
    current.roi += Math.round(row.activations * 12 + row.signups * 4 + row.clicks * 0.25);
    channelPerformance.set(row.channelSlug, current);
  }

  const topChannel = [...channelPerformance.entries()].sort((a, b) => b[1].roi - a[1].roi)[0];
  const weakChannel = [...channelPerformance.entries()]
    .filter(([, row]) => row.clicks >= 5)
    .sort((a, b) => a[1].roi - b[1].roi)[0];
  const hottestMatch = [...matches]
    .map((match) => ({ match, score: scoreOpportunity(match) }))
    .sort((a, b) => b.score - a.score)[0];

  const recommendations: PlaybookRecommendation[] = [];

  if (topChannel) {
    const [channelSlug, performance] = topChannel;
    const schedule = channels.find((channel) => channel.slug === channelSlug);
    const targetCadence = schedule?.cadence === "weekly" || schedule?.cadence === "per-launch-only" ? "daily" : "twice-daily";
    recommendations.push({
      id: `scale-${channelSlug}`,
      title: `Scale ${CHANNEL_LABELS[channelSlug as ChannelSlug] ?? channelSlug}`,
      summary: `${CHANNEL_LABELS[channelSlug as ChannelSlug] ?? channelSlug} is currently your highest-yield channel by ROI.`,
      rationale: `${performance.activations} activations and ${performance.signups} signups are already coming from this channel. GrowthOS should allocate more cadence here while momentum is real.`,
      impact: impactClass(performance.roi),
      actionLabel: `Set ${targetCadence}`,
      action: {
        kind: "update-cadence",
        channelSlug,
        cadence: targetCadence,
        active: true
      }
    });
  }

  if (weakChannel) {
    const [channelSlug, performance] = weakChannel;
    const schedule = channels.find((channel) => channel.slug === channelSlug);
    if (schedule && schedule.cadence !== "per-launch-only") {
      recommendations.push({
        id: `trim-${channelSlug}`,
        title: `Reduce ${CHANNEL_LABELS[channelSlug as ChannelSlug] ?? channelSlug}`,
        summary: `${CHANNEL_LABELS[channelSlug as ChannelSlug] ?? channelSlug} is consuming distribution effort without producing equivalent ROI.`,
        rationale: `${performance.clicks} clicks from this channel only turned into ${performance.activations} activations. Lowering cadence prevents low-yield work from crowding out stronger channels.`,
        impact: impactClass(Math.max(35, performance.clicks * 5 - performance.activations * 4)),
        actionLabel: "Set per-launch-only",
        action: {
          kind: "update-cadence",
          channelSlug,
          cadence: "per-launch-only",
          active: true
        }
      });
    }
  }

  if (hottestMatch) {
    const { match, score } = hottestMatch;
    recommendations.push({
      id: `reply-${match.id}`,
      title: `Queue a reply for ${match.source}`,
      summary: `A high-intent live conversation is active right now and GrowthOS already drafted the response.`,
      rationale: `${match.title} matches the product profile closely, and the opportunity score is ${score}/100. Converting this into an approval-ready draft closes the gap between discovery and action.`,
      impact: impactClass(score),
      actionLabel: "Queue reply draft",
      action: {
        kind: "queue-opportunity",
        matchId: match.id
      }
    });
  }

  const freshestMetric = metrics[0]?.fetchedAt?.toISOString() ?? null;
  return {
    product: {
      id: product.id,
      url: product.url,
      description: product.description
    },
    summary: {
      bestChannel: topChannel?.[0] ? CHANNEL_LABELS[topChannel[0] as ChannelSlug] ?? topChannel[0] : null,
      topRoi: topChannel?.[1].roi ?? 0,
      liveOpportunityScore: hottestMatch?.score ?? 0,
      channelsMeasured: channelPerformance.size,
      lastMetricAt: freshestMetric
    },
    recommendations
  };
}

export async function applyPlaybookRecommendation(productId: string, recommendationId: string) {
  const playbook = await buildPlaybook(productId);
  const recommendation = playbook.recommendations.find((entry) => entry.id === recommendationId);
  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  if (recommendation.action.kind === "update-cadence") {
    const result = await updateChannelSchedule({
      channelSlug: recommendation.action.channelSlug!,
      cadence: recommendation.action.cadence!,
      active: recommendation.action.active ?? true
    });
    await auditMutation("playbook.applied", "Channel", {
      productId,
      recommendationId,
      channelSlug: recommendation.action.channelSlug,
      cadence: recommendation.action.cadence
    });
    return { type: "channel-schedule", result };
  }

  const match = await prisma.wildMatch.findUniqueOrThrow({
    where: { id: recommendation.action.matchId! }
  });
  const channelSlug = sourceToChannel(match.source);
  const channel = await prisma.channel.findUniqueOrThrow({ where: { slug: channelSlug } });

  const suggestion = await prisma.placementSuggestion.create({
    data: {
      productId,
      channelId: channel.id,
      type: "reply-draft",
      title: `Reply to ${match.source}: ${match.title}`,
      body: match.draftReply,
      reasoning: `${match.matchReason} Generated from the Playbook Engine to convert a live opportunity into an approval-ready reply.`,
      viralityScore: 72,
      effortScore: 18,
      audienceFit: 88,
      timeToValue: 2,
      status: "pending",
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.asset.create({
    data: {
      suggestionId: suggestion.id,
      type: "reply-draft",
      title: suggestion.title,
      content: suggestion.body
    }
  });

  await auditMutation("playbook.applied", "PlacementSuggestion", {
    productId,
    recommendationId,
    suggestionId: suggestion.id
  });

  const pending = await prisma.placementSuggestion.count({
    where: { status: "pending" }
  });
  publishEvent({
    type: "queue:update",
    payload: { pending, suggestionId: suggestion.id }
  });

  return { type: "queued-suggestion", result: suggestion };
}
