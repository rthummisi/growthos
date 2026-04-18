export async function post(content: string) {
  return { id: "hashnode-manual", content };
}

export async function fetchMetrics(postId: string): Promise<{ views: number; reactions: number; entityId: string }> {
  try {
    // Hashnode GraphQL API
    const response = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { post(id: "${postId}") { views reactionCount } }`
      }),
      signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) throw new Error("Hashnode API error");
    const data = (await response.json()) as { data?: { post?: { views?: number; reactionCount?: number } } };
    const post = data.data?.post;
    return { views: post?.views ?? 0, reactions: post?.reactionCount ?? 0, entityId: postId };
  } catch {
    return { views: 0, reactions: 0, entityId: postId };
  }
}
