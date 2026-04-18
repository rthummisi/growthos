import type { ChannelSlug } from "@shared/constants/channels";

export interface ChannelMetricPoint {
  channelSlug: ChannelSlug;
  effectivenessScore: number;
  roiScore: number;
  trend: number;
  clicks: number;
  signups: number;
  activations: number;
  lastUpdated: string;
}
