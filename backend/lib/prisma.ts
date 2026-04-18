import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __growthosPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__growthosPrisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__growthosPrisma = prisma;
}
