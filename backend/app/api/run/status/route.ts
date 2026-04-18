import { json } from "@backend/lib/api";
import { getRun } from "@backend/lib/run-state";

export async function GET() {
  return json(getRun() ?? { status: "idle" });
}
