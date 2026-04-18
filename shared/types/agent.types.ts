import type { ChannelSlug } from "@shared/constants/channels";

export type PlacementType =
  | "github-repo"
  | "starter-template"
  | "demo-sandbox"
  | "try-it-yourself"
  | "sdk-example"
  | "blog-article"
  | "community-post"
  | "integration-plugin"
  | "snippet-library"
  | "package-listing"
  | "answer-reply"
  | "awesome-list-entry"
  | "influencer-outreach"
  | "newsletter-submission";

export type AssetType =
  | "readme"
  | "post"
  | "thread"
  | "template"
  | "snippet"
  | "pitch"
  | "reply";

export interface ProductProfile {
  productId: string;
  icp: string;
  plgWedge: string;
  useCases: string[];
  whyDevsShare: string;
  technicalSurface: string[];
  targetCommunities: string[];
}

export interface ChannelFitScore {
  channelSlug: ChannelSlug;
  fitScore: number;
  fitReason: string;
  suggestedTypes: PlacementType[];
}

export interface PlacementSuggestionOutput {
  channelSlug: ChannelSlug;
  type: PlacementType;
  title: string;
  body: string;
  reasoning: string;
  viralityScore: number;
  effortScore: number;
  audienceFit: number;
  timeToValue: number;
  rank?: number;
}

export interface AssetOutput {
  suggestionId: string;
  type: AssetType;
  title: string;
  content: string;
  variations: string[];
}

export interface ExecutionArtifact {
  label: string;
  url?: string;
  content?: string;
}

export interface BrandVoiceConfig {
  tone: string;
  style: string;
  vocabulary: {
    include: string[];
    avoid: string[];
  };
  preset?: string;
}
