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

export interface EffectivenessEntry {
  name: string;
  isBrand: boolean;
  score: number;           // 0-100 composite weighted across all four dimensions
  sovPct: number;          // 0-100 share of voice percentage
  sentimentScore: number;  // 0-100 positive-mention ratio
  intentScore: number;     // 0-100 high-intent-mention ratio
  earnedRatio: number;     // 0-100 earned (non-owned) mention ratio
}

export interface VisibilityResult {
  product: { id: string; url: string; description: string; brandName: string } | null;
  summary: VisibilitySummary | null;
  shareOfVoice: VisibilitySharePoint[];
  sentiment: { positive: number; neutral: number; negative: number };
  intent: { high: number; medium: number; low: number };
  signals: string[];
  mentions: VisibilityMention[];
  effectiveness: EffectivenessEntry[];
  cachedAt: string | null;
  trend: VisibilityTrendPoint[];
}
