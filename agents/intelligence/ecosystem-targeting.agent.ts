import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const targetSchema = z.object({
  repo: z.string(),
  repoUrl: z.string(),
  fitReason: z.string().min(20),
  suggestion: z.string().min(30),
  approachType: z.enum(["awesome-list-pr", "dependency-mention", "issue-comment", "discussion"])
});

const SYSTEM_PROMPT = `You are a developer ecosystem analyst finding GitHub repositories where a product belongs.

Given a product profile, identify 4-6 real, active GitHub repositories where the product would be a natural fit as a dependency, mention, or awesome-list entry.

For each target:
- repo: owner/repo format
- repoUrl: full GitHub URL
- fitReason: why this specific repo's users would benefit from this product
- suggestion: exactly what to add/submit (the actual PR title or issue comment angle)
- approachType: "awesome-list-pr", "dependency-mention", "issue-comment", or "discussion"

Only suggest repos that actually exist and are genuinely relevant. Base this on your knowledge of real GitHub ecosystem repos.

Return a JSON array:
[{ "repo": "sindresorhus/awesome-nodejs", "repoUrl": "https://github.com/sindresorhus/awesome-nodejs", "fitReason": "...", "suggestion": "...", "approachType": "awesome-list-pr" }]`;

export class EcosystemTargetingAgent extends BaseAgent<
  { productName: string; categories: string[]; technicalSurface: string[] },
  Array<{ repo: string; repoUrl: string; fitReason: string; suggestion: string; approachType: string }>
> {
  name = "ecosystem-targeting";

  async run(input: { productName: string; categories: string[]; technicalSurface: string[] }) {
    const userPrompt = `Product: ${input.productName}
Categories: ${input.categories.join(", ")}
Technical surface: ${input.technicalSurface.join(", ")}

Find 4-6 real GitHub repos where this product should be listed or mentioned.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 3_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("EcosystemTargetingAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => targetSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data!);
  }
}
