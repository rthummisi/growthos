import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { AssetOutput } from "@shared/types/agent.types";

function wordOverlap(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const overlap = [...setA].filter((w) => setB.has(w)).length;
  return overlap / Math.max(setA.size, setB.size, 1);
}

function assertUnique(variations: string[]): void {
  for (let i = 0; i < variations.length; i++) {
    for (let j = i + 1; j < variations.length; j++) {
      if (wordOverlap(variations[i], variations[j]) > 0.85) {
        throw new Error(`Variations ${i} and ${j} are too similar (overlap > 0.85)`);
      }
    }
  }
}

const schema = z.array(z.string().min(80));

const SYSTEM_PROMPT = `You are a developer copywriter generating distinct content variations.

Given an original asset and a requested count, produce N unique versions that each:
- Differ meaningfully in opening hook, narrative angle, and CTA
- Are not word substitutions — each should feel like a fresh take
- Are fully written to the same quality and length as the original
- Share no more than 70% word overlap with any other variation

Return a JSON array of strings: ["variation 1 full text", "variation 2 full text", ...]`;

export class ContentVariationAgent extends BaseAgent<
  { asset: AssetOutput; count: number },
  string[]
> {
  name = "content-variation";

  async run(input: { asset: AssetOutput; count: number }) {
    const count = Math.min(Math.max(input.count, 1), 5);

    if (input.asset.variations.length >= count) {
      const existing = input.asset.variations.slice(0, count);
      try {
        assertUnique(existing);
        return existing;
      } catch {
        // existing variations too similar — regenerate via Claude
      }
    }

    const userPrompt = `Original asset (type: ${input.asset.type}):
Title: ${input.asset.title}

Content:
${input.asset.content}

Generate ${count} unique variations of this asset.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 6_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("ContentVariationAgent: no JSON array in Claude response");

    const variations = this.jsonFromText(jsonMatch[0], schema).slice(0, count);
    assertUnique(variations);
    return variations;
  }
}
