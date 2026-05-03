const FIRECRAWL_BASE = "https://api.firecrawl.dev";
const MAX_CONTENT = 15_000;
const FALLBACK_UA = "GrowthOS-WebFallback/1.0 (research bot)";

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

function getTavilyApiKey() {
  return (process.env.TAVILY_API_KEY || "").trim();
}

export async function firecrawlScrape(url: string): Promise<string> {
  const apiKey = getFirecrawlApiKey();
  if (!apiKey) return fetchFallback(url);

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

    if (!res.ok) return fetchFallback(url);
    const data = (await res.json()) as { data?: { markdown?: string } };
    const markdown = (data.data?.markdown ?? "").slice(0, MAX_CONTENT);
    return markdown || await fetchFallback(url);
  } catch {
    return fetchFallback(url);
  }
}

export async function firecrawlSearch(input: {
  query: string;
  limit?: number;
  includeDomains?: string[];
  sources?: Array<"web" | "news">;
}): Promise<FirecrawlSearchResult[]> {
  const apiKey = getFirecrawlApiKey();
  if (!apiKey) return tavilySearch(input);

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

    if (!res.ok) return tavilySearch(input);

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

    const combined = [...webResults, ...newsResults].slice(0, input.limit ?? 10);
    return combined.length > 0 ? combined : tavilySearch(input);
  } catch {
    return tavilySearch(input);
  }
}

async function tavilySearch(input: {
  query: string;
  limit?: number;
  includeDomains?: string[];
}): Promise<FirecrawlSearchResult[]> {
  const apiKey = getTavilyApiKey();
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: input.query,
        search_depth: "basic",
        max_results: input.limit ?? 10,
        include_domains: input.includeDomains
      }),
      signal: AbortSignal.timeout(15_000)
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      results?: Array<{ title: string; url: string; content?: string }>;
    };

    return (data.results ?? []).map((row) => ({
      url: row.url,
      title: row.title,
      description: row.content?.slice(0, 240)
    }));
  } catch {
    return [];
  }
}

async function fetchFallback(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": FALLBACK_UA },
      signal: AbortSignal.timeout(8_000)
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_CONTENT);
  } catch {
    return "";
  }
}
