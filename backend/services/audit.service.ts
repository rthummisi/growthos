import { prisma } from "@backend/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(input: {
  actor: string;
  action: string;
  entityId?: string;
  entityType?: string;
  payload?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actor: input.actor,
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      payload: input.payload as Prisma.InputJsonValue | undefined
    }
  });
}
