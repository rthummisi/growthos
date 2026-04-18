import { json } from "@backend/lib/api";
import { buildDemoTrendData } from "@backend/lib/demo-data";

export async function GET() {
  return json(buildDemoTrendData());
}
