import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const trendSchema = z.object({
  topic: z.string(),
  velocity: z.number().min(0).max(100),
  relevanceScore: z.number().min(0).max(100),
  contentOpportunity: z.string().min(30)
});

async function fetchHNTopStories(): Promise<{ title: string; score: number }[]> {
  try {
    const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      signal: AbortSignal.timeout(5_000)
    });
    const ids = (await response.json()) as number[];
    const top10 = ids.slice(0, 10);
    const stories = await Promise.allSettled(
      top10.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(3_000) })
          .then((r) => r.json() as Promise<{ title: string; score: number }>)
      )
    );
    return stories
      .filter((s) => s.status === "fulfilled")
      .map((s) => (s as PromiseFulfilledResult<{ title: string; score: number }>).value)
      .filter((s) => s?.title);
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `You are a developer marketing analyst detecting content opportunities.

Given recent Hacker News top stories and product keywords, identify trending topics where the product can contribute meaningfully.

For each trend:
- topic: the specific trending topic
- velocity: how fast it is spreading (0-100)
- relevanceScore: how relevant it is to this product's ICP (0-100)
- contentOpportunity: a specific, fully-written content angle the product should take — what to say and why now

Return a JSON array of 3-5 trends:
[{ "topic": "...", "velocity": 85, "relevanceScore": 78, "contentOpportunity": "..." }]`;

export class TrendDetectionAgent extends BaseAgent<
  { productKeywords: string[]; productDescription: string },
  Array<{ topic: string; velocity: number; relevanceScore: number; contentOpportunity: string }>
> {
  name = "trend-detection";

  async run(input: { productKeywords: string[]; productDescription: string }) {
    const hnStories = await fetchHNTopStories();

    const storiesText = hnStories.length
      ? hnStories.map((s) => `- "${s.title}" (score: ${s.score})`).join("\n")
      : "(HN unavailable — use your knowledge of current dev trends)";

    const userPrompt = `Product: ${input.productDescription}
Keywords: ${input.productKeywords.join(", ")}

Current HN top stories:
${storiesText}

Identify 3-5 trending topics relevant to this product with content opportunities.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 3_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("TrendDetectionAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => trendSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data!);
  }
}
