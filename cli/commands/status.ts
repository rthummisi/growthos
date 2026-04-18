const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function statusCommand() {
  const response = await fetch(`${API_BASE}/run/status`);
  console.log(JSON.stringify(await response.json(), null, 2));
}
