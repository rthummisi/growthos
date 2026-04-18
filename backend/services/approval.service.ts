import { prisma } from "@backend/lib/prisma";
import { publishEvent } from "@backend/lib/events";
import { writeAuditLog } from "@backend/services/audit.service";
import type { ApprovalDecisionInput } from "@shared/types/approval.types";

export async function createApproval(input: ApprovalDecisionInput) {
  if (input.modifiedBody) {
    await prisma.suggestionVersion.create({
      data: {
        suggestionId: input.suggestionId,
        body: input.modifiedBody,
        changedBy: "user"
      }
    });

    await prisma.placementSuggestion.update({
      where: { id: input.suggestionId },
      data: { body: input.modifiedBody }
    });
  }

  const approval = await prisma.approval.create({
    data: input
  });

  await prisma.placementSuggestion.update({
    where: { id: input.suggestionId },
    data: { status: input.decision }
  });

  await writeAuditLog({
    actor: "user",
    action: "approval.created",
    entityId: approval.id,
    entityType: "Approval",
    payload: input
  });

  const pending = await prisma.placementSuggestion.count({
    where: { status: "pending" }
  });
  publishEvent({
    type: "queue:update",
    payload: { pending, suggestionId: input.suggestionId }
  });

  return approval;
}
