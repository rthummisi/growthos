export async function post(content: string) {
  return { id: "ph-manual", content, launchUrl: "https://www.producthunt.com/posts/new" };
}

export async function fetchMetrics(postSlug: string): Promise<{ votes: number; comments: number; rank: number | null; entityId: string }> {
  try {
    const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.PRODUCTHUNT_TOKEN ? { Authorization: `Bearer ${process.env.PRODUCTHUNT_TOKEN}` } : {})
      },
      body: JSON.stringify({
        query: `{ post(slug: "${postSlug}") { votesCount commentsCount } }`
      }),
      signal: AbortSignal.timeout(6_000)
    });
    if (!response.ok) throw new Error("PH API error");
    const data = (await response.json()) as { data?: { post?: { votesCount?: number; commentsCount?: number } } };
    const post = data.data?.post;
    return { votes: post?.votesCount ?? 0, comments: post?.commentsCount ?? 0, rank: null, entityId: postSlug };
  } catch {
    return { votes: 0, comments: 0, rank: null, entityId: postSlug };
  }
}
