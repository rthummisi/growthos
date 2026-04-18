export async function post(content: string) {
  return {
    id: "twitter-local",
    content,
    composeUrl: "https://twitter.com/compose/post"
  };
}

export async function fetchMetrics(entityId: string) {
  return { likes: 0, reposts: 0, entityId };
}
