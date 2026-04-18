export async function post(content: string) {
  // Twitter posting requires OAuth 2.0 — prepare compose URL with content
  const encoded = encodeURIComponent(content.slice(0, 280));
  return { id: "twitter-manual", content, composeUrl: `https://twitter.com/intent/tweet?text=${encoded}` };
}

export async function fetchMetrics(tweetId: string): Promise<{ likes: number; reposts: number; impressions: number; entityId: string }> {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    return { likes: 0, reposts: 0, impressions: 0, entityId: tweetId };
  }
  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
      {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        signal: AbortSignal.timeout(6_000)
      }
    );
    if (!response.ok) throw new Error("Twitter API error");
    const data = (await response.json()) as { data?: { public_metrics?: { like_count?: number; retweet_count?: number; impression_count?: number } } };
    const m = data.data?.public_metrics;
    return {
      likes: m?.like_count ?? 0,
      reposts: m?.retweet_count ?? 0,
      impressions: m?.impression_count ?? 0,
      entityId: tweetId
    };
  } catch {
    return { likes: 0, reposts: 0, impressions: 0, entityId: tweetId };
  }
}
