import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { ensureDefaultChannels } from "@backend/lib/bootstrap";
import { bootWorkers } from "@backend/lib/workers";
import { listSchedulerChannels, updateChannelSchedule } from "@backend/services/scheduler.service";

export async function GET() {
  bootWorkers();
  await ensureDefaultChannels();
  return json(await listSchedulerChannels());
}

export async function PATCH(request: NextRequest) {
  bootWorkers();
  const body = (await request.json()) as {
    channelSlug: string;
    cadence: string;
    active: boolean;
  };
  return json(await updateChannelSchedule(body));
}
