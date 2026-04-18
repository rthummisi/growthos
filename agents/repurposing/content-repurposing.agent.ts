import { z } from "zod";
import { CHANNELS } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ProductProfile } from "@shared/types/agent.types";

const rowSchema = z.object({ channel: z.string(), content: z.string().min(40) });

const SYSTEM_PROMPT = `You are a developer content strategist. Given a single core idea and a product profile, rewrite the idea in a format native to each of the 19 developer distribution channels.

Channels and their format requirements:
- github: a complete repository description + README overview paragraph
- producthunt: tagline + maker comment (punchy, < 300 chars each)
- hackernews: Show HN post text (technical, honest, < 200 words)
- reddit: community post body (helpful first, no obvious marketing)
- twitter: a 5-tweet thread (each tweet ≤ 280 chars, numbered 1/)
- discord: a casual community message (< 150 words, value-first)
- slack: professional workspace message (< 100 words)
- devto: article intro paragraph + suggested tags
- hashnode: blog post opening (technical, personal angle)
- linkedin: professional post (200-300 words, ends with question)
- newsletter: submission pitch (subject + 2-paragraph pitch)
- npm-registry: package description + 8 keywords
- awesome-lists: one-line markdown entry + PR body paragraph
- template-platforms: template description (what you build in 5 min)
- integration-marketplace: marketplace listing (features as bullets)
- stackoverflow: a helpful answer mentioning the product naturally
- indiehackers: milestone post (personal, honest, share numbers)
- lobsters: link post description + comment
- bluesky: short thread (4 posts ≤ 300 chars each)

Return a JSON array — one entry per channel (19 total):
[{ "channel": "github", "content": "the full channel-native content" }]

Rules: no "[product name]" placeholders — infer from the profile. Each entry must be fully written and distinct in format.`;

export class ContentRepurposingAgent extends BaseAgent<
  { coreIdea: string; productProfile: ProductProfile },
  { channel: string; content: string }[]
> {
  name = "content-repurposing";

  async run(input: { coreIdea: string; productProfile: ProductProfile }) {
    const userPrompt = `Core idea: ${input.coreIdea}

Product profile:
ICP: ${input.productProfile.icp}
PLG Wedge: ${input.productProfile.plgWedge}
Use cases: ${input.productProfile.useCases.join("; ")}
Why devs share: ${input.productProfile.whyDevsShare}
Technical surface: ${input.productProfile.technicalSurface.join(", ")}

Rewrite this idea for all 19 channels.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 8_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("ContentRepurposingAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    const valid = rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data!);

    // Fill any missing channels with a fallback so we always return all 19
    const covered = new Set(valid.map((r) => r.channel));
    const fallbacks = CHANNELS.filter((ch) => !covered.has(ch)).map((ch) => ({
      channel: ch,
      content: `${input.coreIdea} — adapted for ${ch} with focus on ${input.productProfile.plgWedge}`
    }));

    return [...valid, ...fallbacks];
  }
}
