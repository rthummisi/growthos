import { z } from "zod";
import { CHANNELS, type ChannelSlug } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ChannelFitScore, PlacementType, ProductProfile } from "@shared/types/agent.types";

const channelTypes: Record<ChannelSlug, PlacementType[]> = {
  github: ["github-repo", "starter-template"],
  producthunt: ["community-post", "newsletter-submission"],
  hackernews: ["community-post", "blog-article"],
  reddit: ["community-post", "answer-reply"],
  twitter: ["community-post", "sdk-example"],
  discord: ["community-post", "answer-reply"],
  slack: ["community-post", "answer-reply"],
  devto: ["blog-article", "sdk-example"],
  hashnode: ["blog-article", "sdk-example"],
  linkedin: ["community-post", "blog-article"],
  newsletter: ["newsletter-submission", "influencer-outreach"],
  "npm-registry": ["package-listing", "snippet-library"],
  "awesome-lists": ["awesome-list-entry", "github-repo"],
  "template-platforms": ["starter-template", "demo-sandbox"],
  "integration-marketplace": ["integration-plugin", "try-it-yourself"],
  stackoverflow: ["answer-reply", "snippet-library"],
  indiehackers: ["community-post", "blog-article"],
  lobsters: ["community-post", "blog-article"],
  bluesky: ["community-post", "thread"],
  "instagram-reels": ["short-form-video", "community-post"],
  "youtube-shorts": ["short-form-video", "community-post"],
  tiktok: ["short-form-video", "community-post"]
} as unknown as Record<ChannelSlug, PlacementType[]>;

const rowSchema = z.object({
  channelSlug: z.string(),
  fitScore: z.number().min(0).max(100),
  fitReason: z.string().min(10)
});

const SYSTEM_PROMPT = `You are a developer marketing strategist. Given a product profile, score each distribution channel for fit.

The 21 channels and their audiences:
- github: developers discovering tools via repos, stars, READMEs
- producthunt: makers and early adopters launching/discovering new tools
- hackernews: technical founders, engineers who value depth and craft
- reddit: community-specific devs (r/webdev, r/devops, r/programming etc.)
- twitter: devs and founders following tech trends, threads, demos
- discord: niche dev communities around specific stacks or tools
- slack: professional dev teams, often in specific ecosystem workspaces
- devto: developers writing and reading technical tutorials and articles
- hashnode: developer bloggers and readers in the indie dev community
- linkedin: engineering managers, CTOs, technical decision-makers
- newsletter: developers who read curated weekly digests (TLDR, Bytes)
- npm-registry: JS/Node developers discovering packages via search
- awesome-lists: developers curating and discovering GitHub resource lists
- template-platforms: devs looking for CodeSandbox/StackBlitz/Replit starters
- integration-marketplace: devs looking for VS Code extensions or JetBrains plugins
- stackoverflow: developers searching for solutions to specific technical problems
- indiehackers: solo founders and small teams building and launching products
- lobsters: experienced engineers who value quality and technical depth
- bluesky: developers migrating from Twitter, dev-focused community
- instagram-reels: developers and AI-curious builders discovering tools through quick visual demos, workflow clips, and founder-style explainers
- youtube-shorts: developers and technical buyers discovering new workflows through short tutorial clips, comparisons, and demo-led walkthroughs
- tiktok: developers, indie hackers, and AI-curious builders discovering tools through fast visual proof, founder takes, and workflow clips

Return a JSON array of 21 objects, one per channel, exactly:
[{ "channelSlug": "github", "fitScore": 0-100, "fitReason": "specific reason this product fits or doesn't fit this channel's audience" }]

Rules:
- fitScore must reflect real fit — not all channels score high
- fitReason must be specific to this product and this channel's audience, not generic
- Score below 40 if the product has no natural fit
- Vary scores meaningfully — don't cluster everything 70-80`;

export class ChannelDiscoveryAgent extends BaseAgent<ProductProfile, ChannelFitScore[]> {
  name = "channel-discovery";

  private fallbackScores(input: ProductProfile): ChannelFitScore[] {
    const communities = input.targetCommunities.join(" ").toLowerCase();
    const useCases = input.useCases.join(" ").toLowerCase();
    return CHANNELS.map((slug) => {
      const base =
        slug === "github" ? 92 :
        slug === "youtube-shorts" ? 86 :
        slug === "tiktok" ? 84 :
        slug === "instagram-reels" ? 80 :
        slug === "hackernews" ? 78 :
        slug === "reddit" ? 74 :
        slug === "twitter" ? 72 :
        slug === "producthunt" ? 70 :
        58;
      const modifier =
        communities.includes(slug.replace(/-/g, " ")) || useCases.includes("demo") || useCases.includes("workflow")
          ? 6
          : 0;
      return {
        channelSlug: slug,
        fitScore: Math.min(100, base + modifier),
        fitReason: `This product has a clear ${slug.replace(/-/g, " ")} angle because it can be demonstrated through a concrete developer workflow.`,
        suggestedTypes: channelTypes[slug]
      };
    }).sort((a, b) => b.fitScore - a.fitScore);
  }

  async run(input: ProductProfile) {
    const userPrompt = `Product profile:
ICP: ${input.icp}
PLG Wedge: ${input.plgWedge}
Use cases: ${input.useCases.join(", ")}
Why devs share: ${input.whyDevsShare}
Technical surface: ${input.technicalSurface.join(", ")}
Target communities: ${input.targetCommunities.join(", ")}

Score all 21 channels for this product.`;

    try {
      const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return this.fallbackScores(input);
      }

      const rows = JSON.parse(jsonMatch[0]) as unknown[];

      const parsedRows = rows
        .map((row) => {
          const parsed = rowSchema.safeParse(row);
          if (!parsed.success) return null;
          const slug = parsed.data.channelSlug as ChannelSlug;
          if (!CHANNELS.includes(slug)) return null;
          return {
            channelSlug: slug,
            fitScore: parsed.data.fitScore,
            fitReason: parsed.data.fitReason,
            suggestedTypes: channelTypes[slug]
          };
        })
        .filter((item): item is ChannelFitScore => item !== null)
        .sort((a, b) => b.fitScore - a.fitScore);

      return parsedRows.length > 0 ? parsedRows : this.fallbackScores(input);
    } catch {
      return this.fallbackScores(input);
    }
  }
}
