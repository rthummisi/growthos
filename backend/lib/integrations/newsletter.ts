export async function post(content: string) {
  return {
    id: "newsletter-local",
    content,
    draftTarget: "console.dev"
  };
}

export async function fetchMetrics(entityId: string) {
  return {
    opens: 0,
    clicks: 0,
    entityId
  };
}
