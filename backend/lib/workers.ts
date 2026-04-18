import { registerWorker } from "@backend/lib/queue";
import { processExecutionTask } from "@backend/services/execution.service";
import { runScheduledChannel } from "@backend/services/scheduler.service";

let booted = false;

export function bootWorkers() {
  if (booted) {
    return;
  }
  booted = true;

  registerWorker<{ channelSlug: string }>("scheduler", async (data) => {
    await runScheduledChannel(data.channelSlug);
  });

  registerWorker<{ taskId: string; suggestionId: string }>("execution", async (data) => {
    await processExecutionTask(data);
  });
}
