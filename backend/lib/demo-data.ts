import { CHANNELS } from "@shared/constants/channels";

export function buildDemoTrendData() {
  return CHANNELS.slice(0, 6).map((slug, index) => ({
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
      channel: "hackernews",
      metric: "points",
      currentValue: 187,
      baseline: 12,
      rapidResponseOptions: [
        "Post a follow-up comment with the strongest implementation detail.",
        "Publish a companion demo link and pin it in the asset studio.",
        "Turn the top feedback theme into a short reply thread."
      ]
    }
  ];
}
