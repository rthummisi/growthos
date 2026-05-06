import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { AssetOutput, AssetType, PlacementSuggestionOutput } from "@shared/types/agent.types";

const schema = z.object({
  type: z.string(),
  title: z.string().min(5),
  content: z.string().min(100),
  variations: z.array(z.string().min(80)).min(3).max(5)
});

const shortFormSchema = z.object({
  title: z.string().min(5),
  script: z.string().min(120),
  hooks: z.array(z.string().min(20)).min(3).max(5),
  storyboard: z.string().min(80),
  shotList: z.string().min(80),
  captions: z.string().min(60),
  thumbnailCopy: z.string().min(10),
  cta: z.string().min(10)
});

const ASSET_SYSTEM_PROMPT = `You are a developer copywriter producing production-ready distribution assets.

Given a placement suggestion, produce a polished, fully-written asset and 3 unique variations.

Rules:
- content: the primary asset, complete and copy-paste ready — no placeholders
- variations: 3 meaningfully different versions that differ in hook, opening framing, and CTA — not just word substitutions
- For README type: full markdown document with ## sections (Overview, Install, Quickstart, Why use this, Contributing)
- For post/article type: full text as it would appear published — title, body, conclusion
- For thread type: numbered tweet thread, each tweet <= 280 chars
- For pitch type: complete email with subject, opening, body, CTA
- For reply/answer type: the complete answer text, helpful first, product mention natural
- For snippet type: working code with explanation
- No variation should share > 70% word overlap with another

Return JSON:
{
  "type": "readme|post|thread|template|snippet|pitch|reply",
  "title": "asset title",
  "content": "the primary complete asset",
  "variations": ["variation 1", "variation 2", "variation 3"]
}`;

function inferAssetType(placementType: PlacementSuggestionOutput["type"]): AssetType {
  const map: Record<PlacementSuggestionOutput["type"], AssetType> = {
    "github-repo": "readme",
    "starter-template": "template",
    "demo-sandbox": "template",
    "short-form-video": "video-script",
    "try-it-yourself": "template",
    "sdk-example": "snippet",
    "blog-article": "post",
    "community-post": "post",
    "integration-plugin": "post",
    "snippet-library": "snippet",
    "package-listing": "post",
    "answer-reply": "reply",
    "awesome-list-entry": "post",
    "influencer-outreach": "pitch",
    "newsletter-submission": "pitch"
  };
  return map[placementType] ?? "post";
}

function buildShortFormAsset(input: PlacementSuggestionOutput): AssetOutput {
  const productLabel = input.title.replace(/ launch angle/i, "").trim();
  const channelLabel =
    input.channelSlug === "youtube-shorts"
      ? "YouTube Shorts"
      : input.channelSlug === "tiktok"
        ? "TikTok"
        : "Instagram Reels";
  const hookA = `Most AI tool demos waste 30 seconds. Here is ${productLabel} in one fast workflow.`;
  const hookB = `If your team still explains this problem with screenshots, watch this ${channelLabel} version instead.`;
  const hookC = `One short clip is enough to show why ${productLabel} is easier to adopt.`;
  const script = [
    `Hook: ${hookA}`,
    "",
    "Beat 1: Show the problem state in the first 2 seconds with one concrete friction point.",
    `Beat 2: Narrate the setup in plain language and name the product: ${productLabel}.`,
    "Beat 3: Demo the exact workflow in 3 short visual steps with zoomed-in cursor movement or clean motion callouts.",
    "Beat 4: Flash the result state with a measurable payoff: faster setup, cleaner output, or fewer manual steps.",
    `Beat 5: Close with CTA: Try ${productLabel}, save this walkthrough, and send it to the teammate who owns this workflow.`
  ].join("\n");
  const storyboard = [
    "1. Open on the painful before-state with a bold overlay line.",
    "2. Quick cut to the product UI or repo with one sentence explaining what it solves.",
    "3. Show three action beats: configure, run, inspect result.",
    "4. Insert an overlay callout for the strongest differentiator.",
    "5. End on the result screen plus logo/product URL and CTA."
  ].join("\n");
  const shotList = [
    "- Shot 1: close crop of the problem screen",
    "- Shot 2: product dashboard or repo hero area",
    "- Shot 3: action step one with overlay text",
    "- Shot 4: action step two with cursor highlight",
    "- Shot 5: action step three with proof moment",
    "- Shot 6: end card with CTA and social prompt"
  ].join("\n");
  const captions = [
    hookA,
    "Show the workflow, not the marketing.",
    "Three quick beats. One obvious payoff.",
    "This is the part teams actually care about.",
    `Try ${productLabel} and save this for launch week.`
  ].join("\n");
  const thumbnailCopy = `${productLabel}\nIn 30 Seconds`;

  return {
    suggestionId: "",
    type: "video-script",
    title: `${channelLabel} script for ${productLabel}`,
    content: script,
    variations: [hookA, hookB, hookC],
    components: [
      { type: "hook-set", title: `${channelLabel} hooks`, content: [hookA, hookB, hookC].join("\n") },
      { type: "storyboard", title: `${channelLabel} storyboard`, content: storyboard },
      { type: "shot-list", title: `${channelLabel} shot list`, content: shotList },
      { type: "caption-track", title: `${channelLabel} captions`, content: captions },
      { type: "thumbnail-copy", title: `${channelLabel} cover copy`, content: thumbnailCopy }
    ],
    metricsFocus: ["views", "avgViewDuration", "completionRate", "shares", "saves"]
  };
}

export class AssetGenerationAgent extends BaseAgent<PlacementSuggestionOutput, AssetOutput> {
  name = "asset-generation";

  private fallbackAsset(input: PlacementSuggestionOutput, assetType: AssetType): AssetOutput {
    const content = `# ${input.title}

## Why this exists
${input.reasoning}

## What to publish
${input.body}

## Call to action
Try the product, collect feedback, and route the winning version into the next channel.`;

    return {
      suggestionId: "",
      type: assetType,
      title: input.title,
      content,
      variations: [
        `${input.body} Lead with the problem pain and close with a direct CTA.`,
        `${input.body} Open with the implementation outcome and end with a proof point.`,
        `${input.body} Start with a workflow story and end with a stronger invite to try it.`
      ]
    };
  }

  async run(input: PlacementSuggestionOutput) {
    if (
      input.type === "short-form-video" ||
      input.channelSlug === "instagram-reels" ||
      input.channelSlug === "youtube-shorts" ||
      input.channelSlug === "tiktok"
    ) {
      return buildShortFormAsset(input);
    }

    const assetType = inferAssetType(input.type);

    const userPrompt = `Placement type: ${input.type}
Channel: ${input.channelSlug}
Title: ${input.title}
Body / strategy: ${input.body}
Reasoning: ${input.reasoning}
Virality score: ${input.viralityScore}

Generate the complete primary asset and 3 unique variations for this placement.`;

    try {
      const raw = await this.callClaude(ASSET_SYSTEM_PROMPT, userPrompt, 6_000);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.fallbackAsset(input, assetType);
      }

      const parsed = this.jsonFromText(jsonMatch[0], schema);

      return {
        suggestionId: "",
        type: (parsed.type as AssetType) ?? assetType,
        title: parsed.title,
        content: parsed.content,
        variations: parsed.variations
      };
    } catch {
      return this.fallbackAsset(input, assetType);
    }
  }
}
