export async function post(content: string) {
  return { id: "npm-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { downloads: 0, stars: 0, entityId };
}
