import { Queue, Worker } from "bullmq";
import { redis } from "@backend/lib/redis";

export const schedulerQueue = new Queue("scheduler", { connection: redis });
export const executionQueue = new Queue("execution", { connection: redis });

export function registerWorker<TData>(
  name: string,
  processor: (data: TData) => Promise<void>
) {
  return new Worker(
    name,
    async (job) => {
      await processor(job.data as TData);
    },
    { connection: redis }
  );
}
