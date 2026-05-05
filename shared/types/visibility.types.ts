export interface VisibilityMention {
  url: string;
  title: string;
  snippet: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  intent: "high" | "medium" | "low";
  visibilityScore: number;
  owned: boolean;
  competitorName?: string | null;
}

export interface VisibilitySummary {
  totalMentions: number;
  earnedMentions: number;
  ownedMentions: number;
  shareLeader: string;
  shareLeaderMentions: number;
  highIntentMentions: number;
  positiveMentions: number;
  negativeMentions: number;
}

export interface VisibilitySharePoint {
  name: string;
  mentions: number;
  percentage: number;
}

export interface VisibilityTrendPoint {
  snapshotAt: string;
  shareOfVoice: Array<{ name: string; percentage: number }>;
}

export interface VisibilityResult {
  product: { id: string; url: string; description: string; brandName: string } | null;
  summary: VisibilitySummary | null;
  shareOfVoice: VisibilitySharePoint[];
  sentiment: { positive: number; neutral: number; negative: number };
  intent: { high: number; medium: number; low: number };
  signals: string[];
  mentions: VisibilityMention[];
  cachedAt: string | null;
  trend: VisibilityTrendPoint[];
}
