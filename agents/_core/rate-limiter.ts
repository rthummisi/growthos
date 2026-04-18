const memoryWindow = new Map<string, number[]>();

const limits: Record<string, { periodMs: number; max: number }> = {
  github: { periodMs: 7 * 24 * 60 * 60 * 1000, max: 1 },
  producthunt: { periodMs: 90 * 24 * 60 * 60 * 1000, max: 1 },
  hackernews: { periodMs: 30 * 24 * 60 * 60 * 1000, max: 2 },
  reddit: { periodMs: 24 * 60 * 60 * 1000, max: 5 },
  twitter: { periodMs: 7 * 24 * 60 * 60 * 1000, max: 5 }
};

export function checkRateLimit(channelSlug: string) {
  const config = limits[channelSlug] ?? { periodMs: 24 * 60 * 60 * 1000, max: 3 };
  const now = Date.now();
  const entries = memoryWindow.get(channelSlug) ?? [];
  const activeEntries = entries.filter((timestamp) => now - timestamp < config.periodMs);

  if (activeEntries.length >= config.max) {
    throw new Error(`Rate limit exceeded for channel ${channelSlug}`);
  }

  activeEntries.push(now);
  memoryWindow.set(channelSlug, activeEntries);
}
