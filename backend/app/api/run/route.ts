import { NextRequest } from "next/server";
import { json, auditMutation } from "@backend/lib/api";
import { bootWorkers } from "@backend/lib/workers";
import { getRun } from "@backend/lib/run-state";
import { executeRun } from "@backend/services/run.service";

export async function POST(request: NextRequest) {
  bootWorkers();
  const body = (await request.json()) as { productId: string };
  const { runId } = await executeRun(body.productId);
  await auditMutation("run.started", "Run", { runId, productId: body.productId });
  return json({ runId });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId") ?? undefined;
  return json(getRun(runId) ?? { status: "idle" });
}
