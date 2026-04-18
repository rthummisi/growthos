import { BaseAgent } from "@agents/_core/base-agent";

interface GapInput {
  competitors: Array<{ name: string; channels: { slug: string; score: number }[] }>;
  yourPresence: Array<{ slug: string; score: number }>;
}

export class GapScannerAgent extends BaseAgent<
  GapInput,
  Array<{ channelSlug: string; competitorAverage: number; yourScore: number; gap: number }>
> {
  name = "gap-scanner";

  async run(input: GapInput) {
    const yours = new Map(input.yourPresence.map((entry) => [entry.slug, entry.score]));
    const channelMap = new Map<string, number[]>();
    for (const competitor of input.competitors) {
      for (const channel of competitor.channels) {
        const current = channelMap.get(channel.slug) ?? [];
        current.push(channel.score);
        channelMap.set(channel.slug, current);
      }
    }

    return [...channelMap.entries()]
      .map(([channelSlug, scores]) => {
        const competitorAverage = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        const yourScore = yours.get(channelSlug) ?? 0;
        return {
          channelSlug,
          competitorAverage,
          yourScore,
          gap: competitorAverage - yourScore
        };
      })
      .sort((left, right) => right.gap - left.gap);
  }
}
