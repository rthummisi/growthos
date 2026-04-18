export async function post(content: string) {
  return { id: "so-manual", content, submitUrl: "https://stackoverflow.com/questions" };
}

export async function fetchMetrics(answerId: string): Promise<{ score: number; views: number; isAccepted: boolean; entityId: string }> {
  try {
    const response = await fetch(
      `https://api.stackexchange.com/2.3/answers/${answerId}?site=stackoverflow&filter=!9_bDE(fI5`,
      { signal: AbortSignal.timeout(5_000) }
    );
    if (!response.ok) throw new Error("SO API error");
    const data = (await response.json()) as { items?: { score?: number; is_accepted?: boolean; question_id?: number }[] };
    const item = data.items?.[0];
    return {
      score: item?.score ?? 0,
      views: 0,
      isAccepted: item?.is_accepted ?? false,
      entityId: answerId
    };
  } catch {
    return { score: 0, views: 0, isAccepted: false, entityId: answerId };
  }
}
