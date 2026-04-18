export async function post(content: string) {
  return { id: "so-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { score: 0, views: 0, entityId };
}
