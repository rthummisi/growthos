import { json } from "@backend/lib/api";
import { buildAlerts } from "@backend/lib/demo-data";

export async function GET() {
  return json(buildAlerts());
}
