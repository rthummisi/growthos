export async function post(content: string) {
  return { id: "hn-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { points: 0, comments: 0, entityId };
}
