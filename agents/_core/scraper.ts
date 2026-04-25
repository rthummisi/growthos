const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const MAX_CONTENT = 15_000;

export async function firecrawlScrape(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return "";

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
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
