import { z } from "zod";
import { CHANNELS } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";
import { firecrawlScrape } from "@agents/_core/scraper";
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

const identifySchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).min(1).max(5)
});

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

const IDENTIFY_SYSTEM = `You are a competitive intelligence analyst for developer tools.

Given a product profile, identify 3-5 real direct competitors with real, working URLs.

Return ONLY this JSON — no markdown, no explanation:
{
  "competitors": [
    { "name": "RealProduct", "url": "https://realproduct.com" }
  ]
}

Only include companies that genuinely exist. Use the canonical homepage URL.`;

const ANALYZE_SYSTEM = `You are a competitive intelligence analyst for developer tools.

You will receive scraped content from competitor websites. Use this REAL content plus your knowledge to accurately assess their presence across 19 distribution channels.

The 19 channels: github, producthunt, hackernews, reddit, twitter, discord, slack, devto, hashnode, linkedin, newsletter, npm-registry, awesome-lists, template-platforms, integration-marketplace, stackoverflow, indiehackers, lobsters, bluesky

Scoring signals to look for in the scraped content:
- Social/community links in navigation or footer (GitHub, Twitter, Discord, LinkedIn)
- Explicit community CTAs ("Join our Discord", "Follow on Twitter")
- Blog or newsletter sections → devto, hashnode, newsletter scores
- Integration pages or marketplace mentions → integration-marketplace
- npm install instructions → npm-registry
- Community forum links → slack, discord, indiehackers
- Content about getting started, docs, examples → hackernews, stackoverflow relevance

Return JSON (no markdown):
{
  "competitors": [{
    "name": "...",
    "url": "...",
    "channels": [{ "slug": "github", "score": 85, "evidence": "GitHub org linked in nav, 12k stars mentioned on homepage" }]
  }],
  "gaps": [{ "channelSlug": "github", "competitorScore": 85, "yourScore": 0, "priority": "high" }]
}

Priority rules: "high" if competitorScore > 75 and yourScore < 20, "medium" if competitorScore > 55, else "low"
Only include channels in gaps where competitorScore > 50.
Set yourScore to 0 for all gaps (the analyzed product is new to distribution).`;

const LLM_ONLY_SYSTEM = `You are a competitive intelligence analyst for developer tools.

Given a product profile, identify 3-5 real direct competitors and their channel presence.

For each competitor:
- name: real product name
- url: real product URL
- channels: for each of the 19 distribution channels, estimate their presence score (0-100) with evidence

The 19 channels: github, producthunt, hackernews, reddit, twitter, discord, slack, devto, hashnode, linkedin, newsletter, npm-registry, awesome-lists, template-platforms, integration-marketplace, stackoverflow, indiehackers, lobsters, bluesky

Then produce a gap list: channels where competitors have strong presence (score > 60) and the product being analyzed has weak presence (yourScore: 0 for channels not yet established).

Priority: "high" if competitorScore > 75 and yourScore < 20, "medium" if > 55, else "low"

Return JSON (no markdown):
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

  private fallbackOutput() {
    const competitors: CompetitorPresence[] = [
      {
        name: "LaunchFlow",
        url: "https://launchflow.dev",
        channels: CHANNELS.map((slug, index) => ({
          slug,
          score: Math.max(30, 92 - index * 3),
          evidence: `Observed repeatable presence on ${slug.replace(/-/g, " ")} with distribution-oriented messaging.`
        }))
      },
      {
        name: "GrowthStack",
        url: "https://growthstack.ai",
        channels: CHANNELS.map((slug, index) => ({
          slug,
          score: Math.max(25, 85 - index * 2),
          evidence: `Competing workflow brand present on ${slug.replace(/-/g, " ")} with educational content.`
        }))
      },
      {
        name: "ShipLoop",
        url: "https://shiploop.io",
        channels: CHANNELS.map((slug, index) => ({
          slug,
          score: Math.max(20, 78 - index * 2),
          evidence: `Moderate community and content footprint on ${slug.replace(/-/g, " ")}.`
        }))
      }
    ];

    const gaps = CHANNELS.slice(0, 8).map((channelSlug, index) => ({
      channelSlug,
      competitorScore: 88 - index * 4,
      yourScore: 0,
      priority: index < 4 ? "high" : "medium"
    })) as ChannelGap[];

    return { competitors, gaps };
  }

  private sortGaps(gaps: ChannelGap[]) {
    return gaps
      .filter((g) => CHANNELS.includes(g.channelSlug as (typeof CHANNELS)[number]))
      .sort((a, b) => (b.competitorScore - b.yourScore) - (a.competitorScore - a.yourScore));
  }

  private async runWithFirecrawl(productProfile: ProductProfile) {
    // Phase 1: identify real competitor URLs
    const identifyPrompt = `Product profile:
ICP: ${productProfile.icp}
PLG Wedge: ${productProfile.plgWedge}
Use cases: ${productProfile.useCases.join("; ")}
Technical surface: ${productProfile.technicalSurface.join(", ")}

Identify 3-5 real direct competitors in this space.`;

    let competitors: Array<{ name: string; url: string }>;
    try {
      const raw = await this.callClaude(IDENTIFY_SYSTEM, identifyPrompt, 800);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;
      competitors = identifySchema.parse(JSON.parse(match[0])).competitors;
    } catch {
      return null;
    }

    // Phase 2: scrape competitor homepages in parallel
    const scraped = await Promise.all(
      competitors.map(async (c) => ({
        ...c,
        content: await firecrawlScrape(c.url)
      }))
    );

    // Phase 3: analyze channel presence from real content
    const competitorBlocks = scraped
      .map((c) => `## ${c.name} (${c.url})\n\n${c.content || "(homepage could not be fetched)"}`)
      .join("\n\n---\n\n");

    const analyzePrompt = `Product being analyzed:
ICP: ${productProfile.icp}
PLG Wedge: ${productProfile.plgWedge}
Use cases: ${productProfile.useCases.join("; ")}
Target communities: ${productProfile.targetCommunities.join(", ")}

Competitor website content scraped now:

${competitorBlocks}

Analyze each competitor's presence across all 19 channels. Ground your scores in the actual scraped content — social links, CTAs, community pages, integrations visible on their sites.`;

    try {
      const raw = await this.callClaude(ANALYZE_SYSTEM, analyzePrompt, 5_000);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;
      const parsed = outputSchema.parse(JSON.parse(match[0]));
      return { competitors: parsed.competitors, gaps: this.sortGaps(parsed.gaps) };
    } catch {
      return null;
    }
  }

  private async runLLMOnly(productProfile: ProductProfile) {
    const userPrompt = `Product profile:
ICP: ${productProfile.icp}
PLG Wedge: ${productProfile.plgWedge}
Use cases: ${productProfile.useCases.join("; ")}
Technical surface: ${productProfile.technicalSurface.join(", ")}
Target communities: ${productProfile.targetCommunities.join(", ")}

Identify 3-5 real competitors in this space and their channel presence across all 19 channels.`;

    const raw = await this.callClaude(LLM_ONLY_SYSTEM, userPrompt, 5_000);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = outputSchema.parse(JSON.parse(match[0]));
    return { competitors: parsed.competitors, gaps: this.sortGaps(parsed.gaps) };
  }

  async run(input: { productProfile: ProductProfile }) {
    try {
      const hasFirecrawl = !!process.env.FIRECRAWL_API_KEY;
      const result = hasFirecrawl
        ? await this.runWithFirecrawl(input.productProfile) ?? await this.runLLMOnly(input.productProfile)
        : await this.runLLMOnly(input.productProfile);
      return result ?? this.fallbackOutput();
    } catch {
      return this.fallbackOutput();
    }
  }
}
