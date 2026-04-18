const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function scheduleCommand(channelSlug: string, cadence: string) {
  const response = await fetch(`${API_BASE}/scheduler`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channelSlug, cadence, active: true })
  });
  console.log(await response.text());
}
