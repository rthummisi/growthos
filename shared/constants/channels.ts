export const CHANNELS = [
  "github",
  "producthunt",
  "hackernews",
  "reddit",
  "twitter",
  "discord",
  "slack",
  "devto",
  "hashnode",
  "linkedin",
  "newsletter",
  "npm-registry",
  "awesome-lists",
  "template-platforms",
  "integration-marketplace",
  "stackoverflow",
  "indiehackers",
  "lobsters",
  "bluesky"
] as const;

export type ChannelSlug = (typeof CHANNELS)[number];
