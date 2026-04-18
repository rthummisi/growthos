import { prisma } from "@backend/lib/prisma";
import { writeAuditLog } from "@backend/services/audit.service";

export async function generateUtm(
  productId: string,
  channelSlug: string,
  suggestionId?: string
) {
  const utmContent = suggestionId ?? `${channelSlug}-${Date.now()}`;
  const created = await prisma.utmTracking.create({
    data: {
      productId,
      suggestionId,
      channelSlug,
      utmSource: channelSlug,
      utmMedium: "growthos",
      utmCampaign: productId,
      utmContent
    }
  });
  await writeAuditLog({
    actor: "system",
    action: "utm.created",
    entityId: created.id,
    entityType: "UtmTracking",
    payload: { productId, channelSlug, suggestionId }
  });
  return created;
}

export async function trackEvent(
  utmContent: string,
  event: "click" | "signup" | "activation"
) {
  const field =
    event === "click" ? "clicks" : event === "signup" ? "signups" : "activations";
  const updated = await prisma.utmTracking.updateMany({
    where: { utmContent },
    data: {
      [field]: {
        increment: 1
      }
    }
  });
  await prisma.auditLog.create({
    data: {
      actor: "system",
      action: `utm.${event}`,
      entityType: "UtmTracking",
      payload: { utmContent, event, updated: updated.count }
    }
  });
  return updated;
}
