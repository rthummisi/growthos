import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import { firecrawlSearch, isFirecrawlConfigured } from "@agents/_core/scraper";

export interface WildMatchResult {
  source: string;
  url: string;
  title: string;
  matchReason: string;
  draftReply: string;
}

interface RawResult {
  source: string;
  title: string;
  url: string;
  snippet?: string;
}

const matchSchema = z.object({
  source: z.string(),
  url: z.string(),
  title: z.string(),
  matchReason: z.string().min(20),
  draftReply: z.string().min(80)
});

const UA = "GrowthOS-InTheWild/1.0 (market research bot; contact rthummisi@gmail.com)";

// ── Search functions ────────────────────────────────────────────────────────

async function searchGitHub(query: string): Promise<RawResult[]> {
  if (!process.env.GITHUB_TOKEN) return [];
  try {
    const q = encodeURIComponent(`${query} is:issue is:open`);
    const res = await fetch(
      `https://api.github.com/search/issues?q=${q}&sort=reactions&per_page=8`,
      {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(10_000)
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: { title: string; html_url: string; body?: string }[] };
    return (data.items ?? []).map((i) => ({
      source: "GitHub",
      title: i.title,
      url: i.html_url,
      snippet: i.body?.slice(0, 200)
    }));
  } catch { return []; }
}

async function searchHackerNews(query: string): Promise<RawResult[]> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${q}&tags=(ask_hn,show_hn,story)&hitsPerPage=8&numericFilters=points>5`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { hits?: { title?: string; story_text?: string; objectID: string; url?: string }[] };
    return (data.hits ?? [])
      .filter((h) => h.title)
      .map((h) => ({
        source: "Hacker News",
        title: h.title!,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        snippet: h.story_text?.slice(0, 200)
      }));
  } catch { return []; }
}

async function searchStackOverflow(query: string): Promise<RawResult[]> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${q}&site=stackoverflow&filter=withbody&pagesize=8`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: { title: string; link: string; body?: string }[] };
    return (data.items ?? []).map((i) => ({
      source: "Stack Overflow",
      title: i.title,
      url: i.link,
      snippet: i.body?.replace(/<[^>]+>/g, "").slice(0, 200)
    }));
  } catch { return []; }
}

async function searchReddit(query: string): Promise<RawResult[]> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=year&limit=8&type=link`,
      {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8_000)
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { children?: { data: { title: string; url: string; selftext?: string; subreddit_name_prefixed: string } }[] }
    };
    return (data.data?.children ?? []).map((c) => ({
      source: `Reddit (${c.data.subreddit_name_prefixed})`,
      title: c.data.title,
      url: c.data.url,
      snippet: c.data.selftext?.slice(0, 200)
    }));
  } catch { return []; }
}

async function searchDevTo(keywords: string[]): Promise<RawResult[]> {
  // DEV.to has no full-text search API — query by tag for each keyword
  const results: RawResult[] = [];
  for (const kw of keywords.slice(0, 3)) {
    try {
      const tag = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!tag) continue;
      const res = await fetch(
        `https://dev.to/api/articles?per_page=4&tag=${encodeURIComponent(tag)}&top=30`,
        { signal: AbortSignal.timeout(6_000) }
      );
      if (!res.ok) continue;
      const items = (await res.json()) as { title: string; url: string; description?: string }[];
      for (const i of items) {
        results.push({ source: "DEV.to", title: i.title, url: i.url, snippet: i.description });
      }
    } catch { continue; }
  }
  return results;
}

async function searchLobsters(query: string): Promise<RawResult[]> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://lobste.rs/search.json?q=${q}&what=stories&order=relevance`,
      {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8_000)
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { hits?: { title: string; url?: string; short_id: string; description?: string }[] };
    return (data.hits ?? []).slice(0, 5).map((h) => ({
      source: "Lobsters",
      title: h.title,
      url: h.url ?? `https://lobste.rs/s/${h.short_id}`,
      snippet: h.description?.slice(0, 200)
    }));
  } catch { return []; }
}

async function searchFirecrawl(query: string): Promise<RawResult[]> {
  if (!isFirecrawlConfigured()) return [];
  try {
    const results = await firecrawlSearch({
      query: `${query} developer tool`,
      limit: 10,
      includeDomains: [
        "reddit.com",
        "news.ycombinator.com",
        "stackoverflow.com",
        "github.com",
        "dev.to",
        "lobste.rs",
        "indiehackers.com",
        "hashnode.com",
        "medium.com"
      ]
    });
    return results.map((r) => ({
      source: "Web",
      title: r.title,
      url: r.url,
      snippet: r.description?.slice(0, 200)
    }));
  } catch { return []; }
}

// ── Prompts ─────────────────────────────────────────────────────────────────

const KEYWORD_SYSTEM = `Extract 5–7 short search queries (2–4 words each) representing the core problems this product solves.
Return only a JSON array of strings: ["query one", "query two", ...]
Focus on pain points developers would post about on GitHub, Reddit, Stack Overflow, or Hacker News.`;

const MATCH_SYSTEM = `You are a developer relations specialist finding where a product is genuinely needed.

Given real posts/issues from multiple platforms and a product description, identify the best matches — conversations where this product is the real answer.

Rules:
- Only include genuine matches where the product clearly solves the stated problem
- source: use the exact source label provided (e.g. "GitHub", "Hacker News", "Reddit (r/programming)", "Stack Overflow", "DEV.to", "Lobsters", "Web")
- url: use the exact URL from the search results
- title: the exact post/issue title from the results
- matchReason: 1–2 concrete sentences explaining why this product is the answer
- draftReply: 120–200 word helpful reply — solve the problem first, mention the product naturally at the end, never spammy

Return a JSON array of 5–8 matches:
[{ "source": "...", "url": "https://...", "title": "...", "matchReason": "...", "draftReply": "..." }]`;

// ── Agent ────────────────────────────────────────────────────────────────────

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

    // Step 1: derive search keywords from product profile
    const keywordRaw = await this.callClaude(
      KEYWORD_SYSTEM,
      `Product: ${input.productDescription}\nICP: ${input.icp ?? "developers"}\nUse cases: ${input.useCases ?? ""}`,
      400
    );
    let keywords: string[] = [];
    try {
      const m = keywordRaw.match(/\[[\s\S]*?\]/);
      if (m) keywords = JSON.parse(m[0]) as string[];
    } catch { /* fall through */ }
    if (!keywords.length) keywords = ["developer tool distribution", "PLG growth automation", "dev tool marketing"];

    const primaryQuery = keywords.slice(0, 3).join(" OR ");
    const secondaryQuery = keywords.slice(3).join(" OR ") || primaryQuery;

    // Step 2: fan out to all sources in parallel
    const [github, hn, so, reddit, devto, lobsters, firecrawl] = await Promise.all([
      searchGitHub(primaryQuery),
      searchHackerNews(primaryQuery),
      searchStackOverflow(primaryQuery),
      searchReddit(secondaryQuery),
      searchDevTo(keywords),
      searchLobsters(primaryQuery),
      searchFirecrawl(primaryQuery)
    ]);

    const allResults = [...github, ...hn, ...so, ...reddit, ...devto, ...lobsters, ...firecrawl];

    // Step 3: build context for Claude (cap at 40 results to stay within tokens)
    const deduplicated = allResults.filter(
      (r, i, arr) => arr.findIndex((x) => x.url === r.url) === i
    ).slice(0, 40);

    const sourceSummary = [
      github.length && `GitHub (${github.length})`,
      hn.length && `Hacker News (${hn.length})`,
      so.length && `Stack Overflow (${so.length})`,
      reddit.length && `Reddit (${reddit.length})`,
      devto.length && `DEV.to (${devto.length})`,
      lobsters.length && `Lobsters (${lobsters.length})`,
      firecrawl.length && `Web/Firecrawl (${firecrawl.length})`
    ].filter(Boolean).join(", ");

    const foundItems = deduplicated.length
      ? deduplicated.map((r) => {
          const snippet = r.snippet ? ` — "${r.snippet.replace(/\n/g, " ").slice(0, 120)}"` : "";
          return `[${r.source}] "${r.title}" ${r.url}${snippet}`;
        }).join("\n")
      : keywords.map((kw) => `[Problem space] "${kw}"`).join("\n");

    const userPrompt = `Product: ${input.productDescription}
ICP: ${input.icp ?? "developers"}
Keywords used: ${keywords.join(", ")}
Sources searched: ${sourceSummary || "Claude knowledge only"}
Total results: ${deduplicated.length}

Found posts/issues:
${foundItems}

Pick the 5–8 best matches and write complete draft replies.`;

    // Step 4: Claude scores and writes replies
    const raw = await this.callClaude(MATCH_SYSTEM, userPrompt, 8_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("InTheWildAgent: no JSON array in response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((row) => matchSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data as WildMatchResult);
  }
}
