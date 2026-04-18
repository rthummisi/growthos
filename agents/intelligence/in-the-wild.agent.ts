import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

interface WildMatch {
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
      `https://api.github.com/search/issues?q=${encoded}&sort=reactions&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        },
        signal: AbortSignal.timeout(8_000)
      }
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { items?: { title: string; html_url: string }[] };
    return (data.items ?? []).map((item) => ({ title: item.title, url: item.html_url }));
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `You are a developer relations specialist finding where a product is needed.

Given real search results and product context, produce matches where the product is genuinely the answer.

For each match:
- source: "GitHub", "Stack Overflow", or "Reddit"
- url: the URL provided in the search results (or a realistic one)
- title: the exact post/issue title
- matchReason: why this product specifically solves this person's problem — be concrete
- draftReply: a complete helpful reply (minimum 100 words) that solves the problem first, mentions the product naturally at the end

Return a JSON array:
[{ "source": "GitHub", "url": "https://...", "title": "...", "matchReason": "...", "draftReply": "..." }]`;

export class InTheWildAgent extends BaseAgent<
  { problemKeywords: string[]; productDescription: string },
  WildMatch[]
> {
  name = "in-the-wild";

  async run(input: { problemKeywords: string[]; productDescription: string }) {
    const searchQuery = input.problemKeywords.slice(0, 3).join(" OR ");
    const githubIssues = await searchGitHubIssues(searchQuery);

    const foundItems = githubIssues.length
      ? githubIssues.map((i) => `- GitHub issue: "${i.title}" at ${i.url}`).join("\n")
      : input.problemKeywords
          .slice(0, 4)
          .map((kw) => `- Problem space: "${kw}"`)
          .join("\n");

    const userPrompt = `Product: ${input.productDescription}
Problem keywords: ${input.problemKeywords.join(", ")}

Found posts/issues:
${foundItems}

Generate 3-5 in-the-wild matches with complete draft replies.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 4_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("InTheWildAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => matchSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data as WildMatch);
  }
}
