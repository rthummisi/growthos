const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function alertsCommand() {
  const response = await fetch(`${API_BASE}/alerts`);
  console.table(await response.json());
}
