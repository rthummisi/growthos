import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { AssetOutput, AssetType, PlacementSuggestionOutput } from "@shared/types/agent.types";

const schema = z.object({
  type: z.string(),
  title: z.string().min(5),
  content: z.string().min(100),
  variations: z.array(z.string().min(80)).min(3).max(5)
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

export class AssetGenerationAgent extends BaseAgent<PlacementSuggestionOutput, AssetOutput> {
  name = "asset-generation";

  async run(input: PlacementSuggestionOutput) {
    const assetType = inferAssetType(input.type);

    const userPrompt = `Placement type: ${input.type}
Channel: ${input.channelSlug}
Title: ${input.title}
Body / strategy: ${input.body}
Reasoning: ${input.reasoning}
Virality score: ${input.viralityScore}

Generate the complete primary asset and 3 unique variations for this placement.`;

    const raw = await this.callClaude(ASSET_SYSTEM_PROMPT, userPrompt, 6_000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AssetGenerationAgent: no JSON in Claude response");

    const parsed = this.jsonFromText(jsonMatch[0], schema);

    return {
      suggestionId: "",
      type: (parsed.type as AssetType) ?? assetType,
      title: parsed.title,
      content: parsed.content,
      variations: parsed.variations
    };
  }
}
