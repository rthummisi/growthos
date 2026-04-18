export async function post(content: string) {
  return { id: "linkedin-manual", content };
}

export async function fetchMetrics(entityId: string): Promise<{ impressions: number; clicks: number; reactions: number; entityId: string }> {
  // LinkedIn API requires OAuth and partner access — returns 0 without credentials
  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    return { impressions: 0, clicks: 0, reactions: 0, entityId };
  }
  try {
    const response = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(entityId)}`,
      {
        headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` },
        signal: AbortSignal.timeout(6_000)
      }
    );
    if (!response.ok) throw new Error("LinkedIn API error");
    const data = (await response.json()) as { elements?: [{ totalShareStatistics?: { impressionCount?: number; clickCount?: number; likeCount?: number } }] };
    const stats = data.elements?.[0]?.totalShareStatistics;
    return {
      impressions: stats?.impressionCount ?? 0,
      clicks: stats?.clickCount ?? 0,
      reactions: stats?.likeCount ?? 0,
      entityId
    };
  } catch {
    return { impressions: 0, clicks: 0, reactions: 0, entityId };
  }
}
