const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function metricsCommand(channel?: string) {
  const url = new URL(`${API_BASE}/metrics`);
  if (channel) {
    url.searchParams.set("channelSlug", channel);
  }
  const response = await fetch(url.toString());
  console.table(await response.json());
}
