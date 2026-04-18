export async function post(content: string) {
  // HN submission is manual by design — this prepares the content
  return { id: "hn-manual", content, submitUrl: "https://news.ycombinator.com/submit" };
}

export async function fetchMetrics(entityId: string): Promise<{ points: number; comments: number; rank: number | null; entityId: string }> {
  try {
    // Search via Algolia HN API
    const query = encodeURIComponent(entityId);
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=5`,
      { signal: AbortSignal.timeout(6_000) }
    );
    if (!response.ok) throw new Error("HN API error");
    const data = (await response.json()) as { hits?: { points?: number; num_comments?: number }[] };
    const hit = data.hits?.[0];
    return {
      points: hit?.points ?? 0,
      comments: hit?.num_comments ?? 0,
      rank: null,
      entityId
    };
  } catch {
    return { points: 0, comments: 0, rank: null, entityId };
  }
}
