import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const rowSchema = z.object({
  day: z.number(),
  action: z.string().min(40),
  contentDraft: z.string().min(60)
});

const SYSTEM_PROMPT = `You are a developer relations specialist designing channel account warm-up sequences.

For the specified channel, design a 7-day credibility-building sequence before any product promotion.

Each day entry:
- day: 1-7
- action: what type of activity (e.g. "answer a popular question", "share useful resource", "engage with community discussion")
- contentDraft: the actual content to post or comment — fully written, no placeholders

Rules:
- No product mention until day 7 (and even then, only natural)
- Each day should feel like a real developer participating, not marketing
- Actions must be realistic for a busy team — under 30 minutes each
- Content must be native to the channel's format and norms

Return a JSON array of 7 entries:
[{ "day": 1, "action": "...", "contentDraft": "..." }]`;

export class AccountWarmupAgent extends BaseAgent<
  { channel: string; productContext: string; targetCommunities: string[] },
  Array<{ day: number; action: string; contentDraft: string }>
> {
  name = "account-warmup";

  async run(input: { channel: string; productContext: string; targetCommunities: string[] }) {
    const userPrompt = `Channel: ${input.channel}
Target communities/subreddits/servers: ${input.targetCommunities.join(", ")}
Product context (for topical focus): ${input.productContext}

Design a 7-day warm-up sequence with fully written content for each day.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 3_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AccountWarmupAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data!)
      .sort((a, b) => a.day - b.day);
  }
}
