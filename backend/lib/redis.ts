import IORedis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __growthosRedis: IORedis | undefined;
}

export const redis =
  globalThis.__growthosRedis ??
  new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__growthosRedis = redis;
}
