export async function post(content: string) {
  return {
    id: "ph-local",
    content,
    launchUrl: "https://www.producthunt.com/posts/new"
  };
}

export async function fetchMetrics(entityId: string) {
  return { votes: 0, comments: 0, entityId };
}
