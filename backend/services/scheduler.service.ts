import { prisma } from "@backend/lib/prisma";
import { schedulerQueue } from "@backend/lib/queue";
import { writeAuditLog } from "@backend/services/audit.service";
import { executeRun } from "@backend/services/run.service";
import type { ChannelDefinition } from "@shared/types/channel.types";

function cadenceToMs(cadence: string) {
  switch (cadence) {
    case "twice-daily":
      return 12 * 60 * 60 * 1000;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;
    case "per-launch-only":
      return 0;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export async function listSchedulerChannels(): Promise<ChannelDefinition[]> {
  const channels = await prisma.channel.findMany({ orderBy: { name: "asc" } });
  return channels.map((channel) => ({
    slug: channel.slug as ChannelDefinition["slug"],
    name: channel.name,
    cadence: channel.cadence as ChannelDefinition["cadence"],
    active: channel.active,
    lastRunAt: channel.lastRunAt?.toISOString()
  }));
}

export async function updateChannelSchedule(input: {
  channelSlug: string;
  cadence: string;
  active: boolean;
}) {
  const channel = await prisma.channel.update({
    where: { slug: input.channelSlug },
    data: {
      cadence: input.cadence,
      active: input.active
    }
  });

  const every = cadenceToMs(input.cadence);
  if (input.active && every > 0) {
    await schedulerQueue.upsertJobScheduler(
      `schedule:${input.channelSlug}`,
      {
        every
      },
      {
        name: `schedule:${input.channelSlug}`,
        data: {
          channelSlug: input.channelSlug
        }
      }
    );
  } else {
    await schedulerQueue.removeJobScheduler(`schedule:${input.channelSlug}`).catch(() => undefined);
  }

  await writeAuditLog({
    actor: "user",
    action: "scheduler.updated",
    entityId: channel.id,
    entityType: "Channel",
    payload: input
  });

  return channel;
}

export async function runScheduledChannel(channelSlug: string) {
  const latestProduct = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" }
  });

  if (!latestProduct) {
    return null;
  }

  const result = await executeRun(latestProduct.id);
  await prisma.channel.updateMany({
    where: { slug: channelSlug },
    data: { lastRunAt: new Date() }
  });
  return result;
}
