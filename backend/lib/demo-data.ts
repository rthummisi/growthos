import { CHANNELS } from "@shared/constants/channels";
import type { VisibilityResult } from "@shared/types/visibility.types";

export function buildDemoTrendData() {
  return ["youtube-shorts", "instagram-reels", ...CHANNELS.filter((slug) => slug !== "youtube-shorts" && slug !== "instagram-reels")]
    .slice(0, 6)
    .map((slug, index) => ({
    topic: `${slug} conversation trend`,
    velocity: 100 - index * 7,
    relevanceScore: 90 - index * 5,
    contentOpportunity: `Publish a channel-native asset for ${slug} and tie it to a concrete developer workflow.`
    }));
}

export function buildWildFeed() {
  return [
    {
      source: "GitHub",
      url: "https://github.com/example/issues/1",
      title: "Need a faster setup path for new contributors",
      matchReason: "The product reduces time-to-first-value for onboarding flows.",
      draftReply: "You can reduce the setup burden by sharing a ready-to-run example and a shorter first-run path."
    },
    {
      source: "Reddit",
      url: "https://reddit.com/r/programming/example",
      title: "How do you package reusable launch assets?",
      matchReason: "GrowthOS is designed for packaging and repurposing assets across channels.",
      draftReply: "The reliable path is to keep one canonical asset and generate channel-native variants from it."
    },
    {
      source: "Stack Overflow",
      url: "https://stackoverflow.com/questions/example",
      title: "How do I track channel-specific signups?",
      matchReason: "GrowthOS includes UTM generation and per-channel conversion tracking.",
      draftReply: "Use a deterministic UTM scheme per channel and persist click, signup, and activation counters."
    }
  ];
}

export function buildAlerts() {
  return [
    {
      suggestionId: "demo-suggestion",
      channel: "youtube-shorts",
      metric: "views",
      currentValue: 26100,
      baseline: 1900,
      rapidResponseOptions: [
        "Cut a follow-up short that zooms in on the strongest proof moment from the first clip.",
        "Publish a companion Reel with a contrarian hook and pin the CTA in the caption.",
        "Turn the highest-retention moment into a second clip focused on one workflow outcome."
      ]
    }
  ];
}

export function buildDemoVisibility(): VisibilityResult {
  return {
    product: {
      id: "demo-product-1",
      url: "https://growthos.dev",
      description: "AI-powered PLG distribution engine for developer tools",
      brandName: "growthos"
    },
    summary: {
      totalMentions: 18,
      earnedMentions: 14,
      ownedMentions: 4,
      shareLeader: "growthos",
      shareLeaderMentions: 10,
      highIntentMentions: 5,
      positiveMentions: 9,
      negativeMentions: 2
    },
    shareOfVoice: [
      { name: "growthos", mentions: 10, percentage: 43.5 },
      { name: "posthog", mentions: 8, percentage: 34.8 },
      { name: "june", mentions: 5, percentage: 21.7 }
    ],
    sentiment: { positive: 9, neutral: 7, negative: 2 },
    intent: { high: 5, medium: 7, low: 6 },
    signals: [
      "growthos currently leads share of voice in this sampled market view.",
      "5 high-intent visibility events were detected and should feed into In The Wild or Playbook actions.",
      "2 negative or risk-bearing mentions were detected and need review."
    ],
    mentions: [
      {
        url: "https://news.ycombinator.com/item?id=demo1",
        title: "GrowthOS: PLG distribution engine for dev tools",
        snippet: "Really useful if you're trying to figure out which channels to focus on without hiring a growth team.",
        source: "Hacker News",
        sentiment: "positive",
        intent: "high",
        visibilityScore: 90,
        owned: false,
        competitorName: null
      },
      {
        url: "https://reddit.com/r/SideProject/demo2",
        title: "How do you distribute a developer tool without a marketing budget?",
        snippet: "Looking for recommendations — tried posting manually but it doesn't scale.",
        source: "Reddit",
        sentiment: "neutral",
        intent: "high",
        visibilityScore: 76,
        owned: false,
        competitorName: null
      },
      {
        url: "https://github.com/growthos/growthos",
        title: "GrowthOS — AI-powered PLG distribution",
        snippet: "Star the repo and try the intake flow. Takes under two minutes to get your first channel scores.",
        source: "GitHub",
        sentiment: "positive",
        intent: "medium",
        visibilityScore: 70,
        owned: true,
        competitorName: null
      },
      {
        url: "https://dev.to/demo/posthog-vs-alternatives",
        title: "PostHog alternatives for lean PLG teams",
        snippet: "Several tools came up in this thread — PostHog is solid but the distribution layer is still manual.",
        source: "DEV.to",
        sentiment: "neutral",
        intent: "medium",
        visibilityScore: 58,
        owned: false,
        competitorName: "posthog"
      },
      {
        url: "https://news.ycombinator.com/item?id=demo5",
        title: "Ask HN: Best tools for developer-led growth in 2026?",
        snippet: "Not just analytics — looking for something that helps with distribution across community channels.",
        source: "Hacker News",
        sentiment: "neutral",
        intent: "high",
        visibilityScore: 80,
        owned: false,
        competitorName: null
      }
    ],
    cachedAt: null,
    trend: [
      {
        snapshotAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 28.0 },
          { name: "posthog", percentage: 48.0 },
          { name: "june", percentage: 24.0 }
        ]
      },
      {
        snapshotAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 31.5 },
          { name: "posthog", percentage: 44.5 },
          { name: "june", percentage: 24.0 }
        ]
      },
      {
        snapshotAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 35.0 },
          { name: "posthog", percentage: 42.0 },
          { name: "june", percentage: 23.0 }
        ]
      },
      {
        snapshotAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 37.5 },
          { name: "posthog", percentage: 40.0 },
          { name: "june", percentage: 22.5 }
        ]
      },
      {
        snapshotAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 40.0 },
          { name: "posthog", percentage: 37.0 },
          { name: "june", percentage: 23.0 }
        ]
      },
      {
        snapshotAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 41.5 },
          { name: "posthog", percentage: 36.0 },
          { name: "june", percentage: 22.5 }
        ]
      },
      {
        snapshotAt: new Date().toISOString(),
        shareOfVoice: [
          { name: "growthos", percentage: 43.5 },
          { name: "posthog", percentage: 34.8 },
          { name: "june", percentage: 21.7 }
        ]
      }
    ]
  };
}
