export async function post(content: string) {
  if (!process.env.DEVTO_API_KEY) {
    return { id: "devto-manual", content };
  }
  const response = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.DEVTO_API_KEY },
    body: JSON.stringify({ article: { title: content.split("\n")[0] ?? "Article", body_markdown: content, published: false } }),
    signal: AbortSignal.timeout(8_000)
  });
  const data = (await response.json()) as { id?: number; url?: string };
  return { id: String(data.id ?? "devto-draft"), url: data.url ?? "", content };
}

export async function fetchMetrics(articleId: string): Promise<{ reactions: number; comments: number; views: number; entityId: string }> {
  try {
    const response = await fetch(`https://dev.to/api/articles/${articleId}`, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error("Dev.to API error");
    const data = (await response.json()) as { public_reactions_count?: number; comments_count?: number; page_views_count?: number };
    return {
      reactions: data.public_reactions_count ?? 0,
      comments: data.comments_count ?? 0,
      views: data.page_views_count ?? 0,
      entityId: articleId
    };
  } catch {
    return { reactions: 0, comments: 0, views: 0, entityId: articleId };
  }
}
