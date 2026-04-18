import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const rowSchema = z.object({
  community: z.string(),
  contributionType: z.string(),
  draft: z.string().min(80)
});

const SYSTEM_PROMPT = `You are a developer relations specialist planning community karma-building activities.

For each community provided, generate a specific, genuinely helpful contribution that builds credibility before any product mention.

Rules:
- draft must be fully written content — the actual post, answer, or resource
- No product mention in the draft — pure value contribution
- Content must be native to the community's norms and format
- contributionType: one of "helpful-answer", "resource-share", "tutorial", "code-example", "discussion-prompt"

Return a JSON array:
[{ "community": "r/devops", "contributionType": "helpful-answer", "draft": "the full content to post" }]`;

export class KarmaBuilderAgent extends BaseAgent<
  { communities: string[]; productContext: string },
  Array<{ community: string; contributionType: string; draft: string }>
> {
  name = "karma-builder";

  async run(input: { communities: string[]; productContext: string }) {
    const userPrompt = `Communities: ${input.communities.join(", ")}
Product context (for topical relevance only — do NOT mention product in drafts): ${input.productContext}

Generate one helpful, non-promotional contribution per community.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 4_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("KarmaBuilderAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data!);
  }
}
