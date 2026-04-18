import { NextResponse } from "next/server";
import { writeAuditLog } from "@backend/services/audit.service";

export function json<T>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}

export async function auditMutation(action: string, entityType: string, payload: unknown) {
  await writeAuditLog({
    actor: "api",
    action,
    entityType,
    payload
  });
}
