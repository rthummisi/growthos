import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const influencerSchema = z.object({
  handle: z.string(),
  platform: z.string(),
  followers: z.number(),
  rationale: z.string().min(20),
  outreachDraft: z.string().min(100)
});

const SYSTEM_PROMPT = `You are a developer relations specialist identifying technical influencers for outreach.

Given a product profile, identify 4-6 real developer influencers (1k-50k followers) who regularly discuss this problem space.

For each influencer:
- handle: their Twitter/X or Bluesky handle (real person)
- platform: "twitter" or "bluesky"
- followers: approximate follower count
- rationale: why they are the right person — reference specific content themes they cover
- outreachDraft: a complete, personalized outreach message (100-150 words) that references their actual content focus and makes a non-generic ask

Only include real, verifiable developer influencers in this space — not invented handles.

Return a JSON array:
[{ "handle": "@handle", "platform": "twitter", "followers": 12000, "rationale": "...", "outreachDraft": "..." }]`;

export class InfluencerAgent extends BaseAgent<
  { problemSpace: string; icp: string; technicalSurface: string[] },
  Array<{ handle: string; platform: string; followers: number; rationale: string; outreachDraft: string }>
> {
  name = "influencer";

  async run(input: { problemSpace: string; icp: string; technicalSurface: string[] }) {
    const userPrompt = `Problem space: ${input.problemSpace}
ICP: ${input.icp}
Technical surface: ${input.technicalSurface.join(", ")}

Identify 4-6 real developer influencers who cover this space and draft personalized outreach.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 4_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("InfluencerAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => influencerSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data!);
  }
}
