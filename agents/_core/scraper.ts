const FIRECRAWL_BASE = "https://api.firecrawl.dev";
const MAX_CONTENT = 15_000;

export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description?: string;
  category?: string;
}

function getFirecrawlApiKey() {
  const raw = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_KEY || process.env.FIRECRAWL_TOKEN || "";
  return raw.replace(/^api-/, "").trim();
}

export function isFirecrawlConfigured() {
  return Boolean(getFirecrawlApiKey());
}

export async function firecrawlScrape(url: string): Promise<string> {
  const apiKey = getFirecrawlApiKey();
  if (!apiKey) return "";

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/v2/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: AbortSignal.timeout(15_000)
    });

    if (!res.ok) return "";
    const data = (await res.json()) as { data?: { markdown?: string } };
    return (data.data?.markdown ?? "").slice(0, MAX_CONTENT);
  } catch {
    return "";
  }
}

export async function firecrawlSearch(input: {
  query: string;
  limit?: number;
  includeDomains?: string[];
  sources?: Array<"web" | "news">;
}): Promise<FirecrawlSearchResult[]> {
  const apiKey = getFirecrawlApiKey();
  if (!apiKey) return [];

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/v2/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: input.query,
        limit: input.limit ?? 10,
        includeDomains: input.includeDomains,
        sources: input.sources ?? ["web"],
        ignoreInvalidURLs: true,
        timeout: 20_000,
        country: "US"
      }),
      signal: AbortSignal.timeout(25_000)
    });

    if (!res.ok) return [];

    const payload = (await res.json()) as {
      data?:
        | { web?: FirecrawlSearchResult[]; news?: Array<FirecrawlSearchResult & { snippet?: string; date?: string }> }
        | FirecrawlSearchResult[];
    };

    if (Array.isArray(payload.data)) {
      return payload.data.slice(0, input.limit ?? 10);
    }

    const webResults = payload.data?.web ?? [];
    const newsResults = payload.data?.news?.map((row) => ({
      url: row.url,
      title: row.title,
      description: row.snippet ?? row.description,
      category: row.category
    })) ?? [];

    return [...webResults, ...newsResults].slice(0, input.limit ?? 10);
  } catch {
    return [];
  }
}
