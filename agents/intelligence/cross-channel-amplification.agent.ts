import { z } from "zod";
import { CHANNELS } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";

const CHANNEL_AFFINITIES: Record<string, string[]> = {
  hackernews: ["twitter", "reddit", "devto", "lobsters"],
  producthunt: ["twitter", "linkedin", "indiehackers"],
  reddit: ["twitter", "discord", "hackernews"],
  twitter: ["linkedin", "bluesky", "devto"],
  github: ["hackernews", "twitter", "awesome-lists", "npm-registry"],
  devto: ["hashnode", "twitter", "newsletter"],
  linkedin: ["twitter", "newsletter"],
  stackoverflow: ["reddit", "devto", "discord"]
};

const rowSchema = z.object({
  channel: z.string(),
  reason: z.string().min(20),
  contentAngle: z.string().min(30),
  urgency: z.enum(["immediate", "within-1h", "within-4h"])
});

const SYSTEM_PROMPT = `You are a growth strategist deciding which channels to amplify a viral moment to.

Given a source channel that just exceeded its engagement threshold, identify 3-5 adjacent channels where the same content would spread further right now.

For each amplification target:
- channel: the target channel slug
- reason: why this channel's audience will care about this specific content
- contentAngle: how to adapt the message for that channel's format (specific, not generic)
- urgency: "immediate" (within 15 min), "within-1h", or "within-4h"

Return a JSON array:
[{ "channel": "twitter", "reason": "...", "contentAngle": "...", "urgency": "immediate" }]`;

export class CrossChannelAmplificationAgent extends BaseAgent<
  { sourceChannel: string; threshold: number; contentSummary: string; currentMetric: number },
  Array<{ channel: string; reason: string; contentAngle: string; urgency: string }>
> {
  name = "cross-channel-amplification";

  async run(input: { sourceChannel: string; threshold: number; contentSummary: string; currentMetric: number }) {
    const affinityChannels = (CHANNEL_AFFINITIES[input.sourceChannel] ?? CHANNELS.slice(0, 4)).join(", ");

    const userPrompt = `Source channel: ${input.sourceChannel}
Engagement metric: ${input.currentMetric} (threshold was ${input.threshold})
Content that is spiking: ${input.contentSummary}

Preferred amplification channels: ${affinityChannels}

Identify the best 3-5 channels to amplify to right now.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 2_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      const fallback = CHANNEL_AFFINITIES[input.sourceChannel] ?? ["twitter", "linkedin", "reddit"];
      return fallback.slice(0, 3).map((ch) => ({
        channel: ch,
        reason: `${ch} audience overlaps with ${input.sourceChannel} and content is trending.`,
        contentAngle: `Adapt the key insight from ${input.sourceChannel} into ${ch}-native format.`,
        urgency: "within-1h"
      }));
    }

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data!)
      .filter((r) => CHANNELS.includes(r.channel as (typeof CHANNELS)[number]) && r.channel !== input.sourceChannel);
  }
}
