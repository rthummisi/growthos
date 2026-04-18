export async function post(content: string) {
  return { id: "hashnode-local", content };
}

export async function fetchMetrics(entityId: string) {
  return { views: 0, reactions: 0, entityId };
}
