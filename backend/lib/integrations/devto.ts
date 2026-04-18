export async function post(content: string) {
  return { id: "devto-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { reactions: 0, comments: 0, entityId };
}
