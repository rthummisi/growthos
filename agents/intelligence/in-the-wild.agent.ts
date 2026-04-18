import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

export interface WildMatchResult {
  source: string;
  url: string;
  title: string;
  matchReason: string;
  draftReply: string;
}

const matchSchema = z.object({
  source: z.string(),
  url: z.string(),
  title: z.string(),
  matchReason: z.string().min(20),
  draftReply: z.string().min(80)
});

async function searchGitHubIssues(query: string): Promise<{ title: string; url: string }[]> {
  if (!process.env.GITHUB_TOKEN) return [];
  try {
    const encoded = encodeURIComponent(`${query} is:issue is:open`);
    const response = await fetch(
      `https://api.github.com/search/issues?q=${encoded}&sort=reactions&per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        },
        signal: AbortSignal.timeout(10_000)
      }
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { items?: { title: string; html_url: string }[] };
    return (data.items ?? []).map((item) => ({ title: item.title, url: item.html_url }));
  } catch {
    return [];
  }
}

const KEYWORD_SYSTEM = `Extract 4–6 short search keywords (2–4 words each) that represent the core problems this product solves.
Return only a JSON array of strings: ["keyword one", "keyword two", ...]
Focus on the pain points developers would post about on GitHub, Reddit, or Stack Overflow.`;

const MATCH_SYSTEM = `You are a developer relations specialist finding where a product is genuinely needed.

Given real search results and product context, produce matches where the product is the answer.

For each match:
- source: "GitHub", "Reddit", or "Stack Overflow"
- url: the exact URL from search results
- title: the exact post/issue title
- matchReason: why this product specifically solves this person's problem (be concrete, 1–2 sentences)
- draftReply: a complete helpful reply (minimum 120 words) that solves the problem first, mentions the product naturally at the end — never spammy

Return a JSON array:
[{ "source": "GitHub", "url": "https://...", "title": "...", "matchReason": "...", "draftReply": "..." }]`;

export class InTheWildAgent extends BaseAgent<
  { productDescription: string; icp?: string; useCases?: string },
  WildMatchResult[]
> {
  name = "in-the-wild";

  async run(input: {
    productDescription: string;
    icp?: string;
    useCases?: string;
  }): Promise<WildMatchResult[]> {
    // Step 1: derive problem keywords from the product profile
    const keywordPrompt = `Product: ${input.productDescription}
ICP: ${input.icp ?? "developers"}
Use cases: ${input.useCases ?? ""}`;

    const keywordRaw = await this.callClaude(KEYWORD_SYSTEM, keywordPrompt, 300);
    let keywords: string[] = [];
    try {
      const m = keywordRaw.match(/\[[\s\S]*?\]/);
      if (m) keywords = JSON.parse(m[0]) as string[];
    } catch {
      keywords = [];
    }
    if (keywords.length === 0) {
      keywords = ["developer tool distribution", "channel distribution", "PLG growth"];
    }

    // Step 2: search GitHub with top 3 keywords
    const searchQuery = keywords.slice(0, 3).join(" OR ");
    const githubIssues = await searchGitHubIssues(searchQuery);

    const foundItems = githubIssues.length
      ? githubIssues.map((i) => `- GitHub issue: "${i.title}" at ${i.url}`).join("\n")
      : keywords.map((kw) => `- Problem space: "${kw}"`).join("\n");

    // Step 3: Claude finds genuine matches and writes replies
    const userPrompt = `Product: ${input.productDescription}
ICP: ${input.icp ?? "developers"}
Problem keywords: ${keywords.join(", ")}

Found posts/issues:
${foundItems}

Generate 4–6 in-the-wild matches with complete draft replies. Only include genuine matches where the product is the real answer.`;

    const raw = await this.callClaude(MATCH_SYSTEM, userPrompt, 6_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("InTheWildAgent: no JSON array in response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => matchSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data as WildMatchResult);
  }
}
