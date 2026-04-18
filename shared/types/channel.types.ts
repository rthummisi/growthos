import type { ChannelSlug } from "@shared/constants/channels";

export interface ChannelDefinition {
  slug: ChannelSlug;
  name: string;
  cadence: "daily" | "twice-daily" | "weekly" | "per-launch-only";
  active: boolean;
  lastRunAt?: string;
}
