export async function post(content: string) {
  return { id: "linkedin-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { impressions: 0, clicks: 0, entityId };
}
