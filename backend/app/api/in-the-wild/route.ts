import { json } from "@backend/lib/api";
import { buildWildFeed } from "@backend/lib/demo-data";

export async function GET() {
  return json(buildWildFeed());
}
