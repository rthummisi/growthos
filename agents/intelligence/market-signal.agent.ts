import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

export interface MarketSignalResult {
  insight: string;
  priority: "high" | "medium" | "low";
  suggestion: string;
}

const signalSchema = z.object({
  insight: z.string().min(20),
  priority: z.enum(["high", "medium", "low"]),
  suggestion: z.string().min(30)
});

const SYSTEM_PROMPT = `You are a product strategy advisor analysing real market conversations to surface actionable signals.

Given a list of conversations where people are asking for help with problems your product solves, identify:
- What problems keep recurring (patterns, not one-offs)
- How urgent or widespread each pattern is
- What the product should prioritise or do to capture this demand

Return a JSON array of 2–4 signals:
[{
  "insight": "one-sentence description of the recurring problem pattern",
  "priority": "high" | "medium" | "low",
  "suggestion": "concrete action the product/founder should take — be specific, not generic"
}]

Priority guide:
- high: appears 3+ times or is clearly blocking people right now
- medium: appears 2 times or represents a significant use case
- low: appeared once but signals an adjacent opportunity worth watching`;

export class MarketSignalAgent extends BaseAgent<
  { productDescription: string; matches: Array<{ title: string; matchReason: string; source: string }> },
  MarketSignalResult[]
> {
  name = "market-signal";

  async run(input: {
    productDescription: string;
    matches: Array<{ title: string; matchReason: string; source: string }>;
  }): Promise<MarketSignalResult[]> {
    if (input.matches.length === 0) return [];

    const matchSummary = input.matches
      .map((m, i) => `${i + 1}. [${m.source}] "${m.title}" — ${m.matchReason}`)
      .join("\n");

    const userPrompt = `Product: ${input.productDescription}

Recent market conversations (${input.matches.length} total):
${matchSummary}

Analyse the patterns. What problems keep recurring? What should the product prioritise?`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 2_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => signalSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data as MarketSignalResult);
  }
}
