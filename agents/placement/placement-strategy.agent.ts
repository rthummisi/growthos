import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ChannelFitScore, PlacementSuggestionOutput, ProductProfile } from "@shared/types/agent.types";

const rowSchema = z.object({
  channelSlug: z.string(),
  type: z.string(),
  title: z.string().min(5),
  body: z.string().min(50),
  reasoning: z.string().min(20),
  viralityScore: z.number().min(0).max(100),
  effortScore: z.number().min(0).max(100),
  audienceFit: z.number().min(0).max(100),
  timeToValue: z.number().min(1)
});

const SYSTEM_PROMPT = `You are a senior developer marketing strategist who writes production-ready distribution content.

For each channel provided, generate a specific, fully-written placement suggestion.

CRITICAL RULES:
- body must be the actual content to publish — fully written, not a description of what to write
- No placeholder text like "[your product name]" or "[insert link]" — infer names and details from the product profile
- body for community-post or blog-article: 150-400 words of real copy
- body for github-repo: a full README with title, description, install, quickstart, and why-use-this sections
- body for answer-reply: a complete, helpful answer with a natural product mention
- body for newsletter-submission: the actual pitch email text
- body for awesome-list-entry: the markdown line entry + brief PR body
- reasoning: specific viral mechanism for this product on this channel — not generic
- viralityScore: how likely this spreads within the channel audience (0-100)
- effortScore: implementation effort — 0=trivial, 100=very hard
- audienceFit: match between ICP and channel audience (0-100)
- timeToValue: days from posting to measurable impact

Return a JSON array, one object per channel:
[{
  "channelSlug": "github",
  "type": "github-repo",
  "title": "compelling, specific title",
  "body": "the complete, fully-written, copy-paste-ready content",
  "reasoning": "specific viral mechanism and why it works for this product on this channel",
  "viralityScore": 82,
  "effortScore": 35,
  "audienceFit": 90,
  "timeToValue": 14
}]`;

export class PlacementStrategyAgent extends BaseAgent<
  { productProfile: ProductProfile; channelScores: ChannelFitScore[]; limit?: number },
  PlacementSuggestionOutput[]
> {
  name = "placement-strategy";

  async run(input: { productProfile: ProductProfile; channelScores: ChannelFitScore[]; limit?: number }) {
    const limit = input.limit ?? 10;
    const topChannels = input.channelScores.slice(0, limit);

    const channelList = topChannels
      .map((ch) => `- ${ch.channelSlug} (type: ${ch.suggestedTypes[0]}, fit: ${ch.fitScore}/100, reason: ${ch.fitReason})`)
      .join("\n");

    const userPrompt = `Product profile:
ICP: ${input.productProfile.icp}
PLG Wedge: ${input.productProfile.plgWedge}
Use cases: ${input.productProfile.useCases.join("; ")}
Why devs share: ${input.productProfile.whyDevsShare}
Technical surface: ${input.productProfile.technicalSurface.join(", ")}

Channels to generate for:
${channelList}

Generate one fully-written, production-ready placement per channel.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 8_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("PlacementStrategyAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];

    return rows
      .map((row) => {
        const parsed = rowSchema.safeParse(row);
        if (!parsed.success) return null;
        const channelScore = topChannels.find((ch) => ch.channelSlug === parsed.data.channelSlug);
        return {
          ...parsed.data,
          channelSlug: parsed.data.channelSlug as PlacementSuggestionOutput["channelSlug"],
          type: parsed.data.type as PlacementSuggestionOutput["type"],
          audienceFit: channelScore?.fitScore ?? parsed.data.audienceFit
        };
      })
      .filter((item): item is PlacementSuggestionOutput => item !== null);
  }
}
