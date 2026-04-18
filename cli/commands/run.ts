import { EventSource } from "eventsource";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function runCommand(productId: string) {
  const response = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  });
  const payload = (await response.json()) as { runId: string };
  console.log(`Run started: ${payload.runId}`);

  const source = new EventSource(`${API_BASE}/sse?runId=${payload.runId}`);
  source.onmessage = (event: MessageEvent<string>) => console.log(event.data);
  setTimeout(() => source.close(), 5_000);
}
