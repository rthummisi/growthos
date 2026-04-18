import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { BrandVoiceConfig, ChannelFitScore, PlacementSuggestionOutput, ProductProfile } from "@shared/types/agent.types";

export interface ChannelAgentInput {
  productProfile: ProductProfile;
  channelFitScore: ChannelFitScore;
  brandVoice: BrandVoiceConfig;
  placementType: PlacementSuggestionOutput["type"];
}

export interface ChannelAgentOutput extends PlacementSuggestionOutput {
  channelSpecific: Record<string, unknown>;
}

const outputSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(80),
  reasoning: z.string().min(20),
  viralityScore: z.number().min(0).max(100),
  effortScore: z.number().min(0).max(100),
  audienceFit: z.number().min(0).max(100),
  timeToValue: z.number().min(1)
});

const CHANNEL_GUIDES: Record<string, string> = {
  github: "Produce a complete GitHub repo README and description. Include: one-line tagline, install instructions, 5-minute quickstart, real code examples, and a compelling why-use-this section. Topics: list 5-8 relevant GitHub topics.",
  producthunt: "Write a Product Hunt launch post. Include: punchy tagline (< 60 chars), maker comment (200-300 words explaining the origin story and key differentiator), and gallery description.",
  hackernews: "Write a Show HN post. Title must start with 'Show HN:'. Body: 150-250 words, technical depth, honest about limitations, ends with a specific question to drive discussion.",
  reddit: "Write a Reddit post for a relevant subreddit. Tone: genuine, community-first, no obvious marketing. Share something actually useful. Mention the product naturally at the end.",
  twitter: "Write a Twitter/X thread. Format: numbered tweets 1/ 2/ 3/ etc. Each tweet ≤ 280 chars. Hook tweet must grab attention in first 5 words. 5-8 tweets total.",
  discord: "Write a Discord community message. Casual, helpful tone. Share something valuable first, then mention the product as a natural follow-up resource. 100-200 words.",
  slack: "Write a Slack message for a professional developer workspace. Concise, professional, value-first. Include a link placeholder and one clear ask. < 150 words.",
  devto: "Write a complete Dev.to article. Include: SEO title, 4-5 relevant tags, 400-600 word article with code examples, personal angle, and actionable takeaway.",
  hashnode: "Write a Hashnode post. Technical depth, personal narrative, practical examples. 400-600 words. Include suggested series name if applicable.",
  linkedin: "Write a LinkedIn post for technical decision-makers. Professional but not corporate. Lead with a counterintuitive insight. 200-350 words. End with a question.",
  newsletter: "Write a newsletter submission pitch. Format: subject line, one-paragraph product summary, why-readers-care section, and suggested blurb (50 words) for TLDR/Bytes/console.dev.",
  "npm-registry": "Write an npm package README and keywords list. Include: description, install command, API reference (at least 3 methods), usage example, and 10 relevant npm keywords.",
  "awesome-lists": "Write the markdown entry for an awesome list (one line) and a PR body (150 words) explaining why this belongs on the list.",
  "template-platforms": "Write a template description for CodeSandbox/StackBlitz. Include: what the template demonstrates, who it's for, what they'll build in 5 minutes, and fork instructions.",
  "integration-marketplace": "Write a VS Code or JetBrains marketplace listing. Include: extension name, one-line description, feature list (5-8 bullets), and getting-started instructions.",
  stackoverflow: "Write a complete Stack Overflow answer for a relevant question in this problem space. Be genuinely helpful. Mention the product as one option, not the only option. Include a code example.",
  indiehackers: "Write an IndieHackers milestone post. Personal, honest, share real numbers if possible. 200-400 words. What you built, how you launched, what you learned.",
  lobsters: "Write a Lobste.rs link post. Title must be specific and technically accurate. Include tags. Add a comment (50-100 words) explaining technical interest.",
  bluesky: "Write a Bluesky thread. Dev-community tone, technical substance. 4-6 posts, each ≤ 300 chars. Lead with something genuinely interesting, not promotional."
};

export abstract class BaseChannelAgent extends BaseAgent<ChannelAgentInput, ChannelAgentOutput> {
  protected channelGuide(channelSlug: string): string {
    return CHANNEL_GUIDES[channelSlug] ?? "Write a complete, channel-native placement for this product.";
  }

  protected buildSystemPrompt(input: ChannelAgentInput): string {
    const vocab = input.brandVoice.vocabulary;
    return `You are a developer marketing expert writing channel-native content.

Channel: ${input.channelFitScore.channelSlug}
Placement type: ${input.placementType}
Channel guide: ${this.channelGuide(input.channelFitScore.channelSlug)}

Brand voice:
- Tone: ${input.brandVoice.tone}
- Style: ${input.brandVoice.style}
${vocab.include.length ? `- Use these terms: ${vocab.include.join(", ")}` : ""}
${vocab.avoid.length ? `- Avoid: ${vocab.avoid.join(", ")}` : ""}

Product:
- ICP: ${input.productProfile.icp}
- PLG Wedge: ${input.productProfile.plgWedge}
- Use cases: ${input.productProfile.useCases.join("; ")}
- Why devs share it: ${input.productProfile.whyDevsShare}
- Technical surface: ${input.productProfile.technicalSurface.join(", ")}

RULES:
- body must be the actual copy-paste-ready content — fully written
- No placeholder text like "[product name]" or "[your link]"
- Content must be native to ${input.channelFitScore.channelSlug} in tone and format

Return JSON:
{
  "title": "specific compelling title",
  "body": "the complete, fully-written content",
  "reasoning": "why this angle works for this product on this channel",
  "viralityScore": 0-100,
  "effortScore": 0-100,
  "audienceFit": 0-100,
  "timeToValue": days
}`;
  }

  async run(input: ChannelAgentInput): Promise<ChannelAgentOutput> {
    const channelSpecific = this.channelSpecificMetadata(input);
    const systemPrompt = this.buildSystemPrompt(input);
    const userPrompt = `Generate a ${input.placementType} for ${input.channelFitScore.channelSlug}. Channel fit reason: ${input.channelFitScore.fitReason}`;

    const raw = await this.callClaude(systemPrompt, userPrompt, 4_000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`${this.name}: no JSON in Claude response`);

    const parsed = outputSchema.parse(JSON.parse(jsonMatch[0]));

    return {
      channelSlug: input.channelFitScore.channelSlug,
      type: input.placementType,
      ...parsed,
      channelSpecific
    };
  }

  protected channelSpecificMetadata(_input: ChannelAgentInput): Record<string, unknown> {
    return {};
  }
}

export function buildChannelOutput(
  input: ChannelAgentInput,
  channelSpecific: Record<string, unknown>
): ChannelAgentOutput {
  // Sync fallback used only when a channel agent doesn't override run()
  return {
    channelSlug: input.channelFitScore.channelSlug,
    type: input.placementType,
    title: `${input.channelFitScore.channelSlug} placement for product`,
    body: input.channelFitScore.fitReason,
    reasoning: input.channelFitScore.fitReason,
    viralityScore: input.channelFitScore.fitScore,
    effortScore: 35,
    audienceFit: input.channelFitScore.fitScore,
    timeToValue: 7,
    channelSpecific
  };
}
