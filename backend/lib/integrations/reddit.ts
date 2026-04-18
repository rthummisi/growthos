export async function post(content: string) {
  return {
    id: "reddit-local",
    content,
    submissionUrl: "https://reddit.com/r/programming/submit"
  };
}

export async function fetchMetrics(entityId: string) {
  return { upvotes: 0, comments: 0, entityId };
}
