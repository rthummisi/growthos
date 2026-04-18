export async function post(content: string) {
  // Reddit posting requires OAuth — prepare content for manual submission
  return { id: "reddit-manual", content, submissionUrl: "https://reddit.com/submit" };
}

export async function fetchMetrics(postUrl: string): Promise<{ upvotes: number; comments: number; ratio: number; entityId: string }> {
  try {
    // Reddit JSON API (public, no auth needed for reads)
    const jsonUrl = postUrl.replace(/\/?$/, ".json");
    const response = await fetch(jsonUrl, {
      headers: { "User-Agent": "GrowthOS-Metrics/1.0" },
      signal: AbortSignal.timeout(6_000)
    });
    if (!response.ok) throw new Error("Reddit API error");
    const data = (await response.json()) as [{ data?: { children?: [{ data?: { ups?: number; num_comments?: number; upvote_ratio?: number } }] } }];
    const post = data[0]?.data?.children?.[0]?.data;
    return {
      upvotes: post?.ups ?? 0,
      comments: post?.num_comments ?? 0,
      ratio: post?.upvote_ratio ?? 0,
      entityId: postUrl
    };
  } catch {
    return { upvotes: 0, comments: 0, ratio: 0, entityId: postUrl };
  }
}
