import { z } from "zod";
import { CHANNELS } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ProductProfile } from "@shared/types/agent.types";

interface CompetitorPresence {
  name: string;
  url: string;
  channels: { slug: string; score: number; evidence: string }[];
}

interface ChannelGap {
  channelSlug: string;
  competitorScore: number;
  yourScore: number;
  priority: "high" | "medium" | "low";
}

const competitorSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  channels: z.array(z.object({
    slug: z.string(),
    score: z.number().min(0).max(100),
    evidence: z.string()
  }))
});

const outputSchema = z.object({
  competitors: z.array(competitorSchema),
  gaps: z.array(z.object({
    channelSlug: z.string(),
    competitorScore: z.number(),
    yourScore: z.number(),
    priority: z.enum(["high", "medium", "low"])
  }))
});

const SYSTEM_PROMPT = `You are a competitive intelligence analyst for developer tools.

Given a product profile, identify 3-5 real direct competitors and their channel presence.

For each competitor:
- name: real product name
- url: real product URL
- channels: for each of the 19 distribution channels, estimate their presence score (0-100) with evidence

The 19 channels: github, producthunt, hackernews, reddit, twitter, discord, slack, devto, hashnode, linkedin, newsletter, npm-registry, awesome-lists, template-platforms, integration-marketplace, stackoverflow, indiehackers, lobsters, bluesky

Then produce a gap list: channels where competitors have strong presence (score > 60) and the product being analyzed has weak presence (yourScore: 0 for channels not yet established).

Priority: "high" if competitorScore > 75 and yourScore < 20, "medium" if > 55, else "low"

Return JSON:
{
  "competitors": [{
    "name": "RealProductName",
    "url": "https://realproduct.com",
    "channels": [{ "slug": "github", "score": 85, "evidence": "Active GitHub org with 12k stars, multiple demo repos" }]
  }],
  "gaps": [{ "channelSlug": "github", "competitorScore": 85, "yourScore": 0, "priority": "high" }]
}

Only include channels in gaps where competitorScore > 50. Base competitor info on your knowledge of real tools in this space.`;

export class CompetitorAgent extends BaseAgent<
  { productProfile: ProductProfile },
  { competitors: CompetitorPresence[]; gaps: ChannelGap[] }
> {
  name = "competitor-intelligence";

  async run(input: { productProfile: ProductProfile }) {
    const userPrompt = `Product profile:
ICP: ${input.productProfile.icp}
PLG Wedge: ${input.productProfile.plgWedge}
Use cases: ${input.productProfile.useCases.join("; ")}
Technical surface: ${input.productProfile.technicalSurface.join(", ")}
Target communities: ${input.productProfile.targetCommunities.join(", ")}

Identify 3-5 real competitors in this space and their channel presence across all 19 channels.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 5_000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("CompetitorAgent: no JSON in Claude response");

    const parsed = outputSchema.parse(JSON.parse(jsonMatch[0]));

    const validGaps = parsed.gaps.filter((gap) =>
      CHANNELS.includes(gap.channelSlug as (typeof CHANNELS)[number])
    );

    return {
      competitors: parsed.competitors,
      gaps: validGaps.sort((a, b) => (b.competitorScore - b.yourScore) - (a.competitorScore - a.yourScore))
    };
  }
}
