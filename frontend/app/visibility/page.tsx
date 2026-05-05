import { apiGet } from "@frontend/lib/api";
import { BrandVisibilityDashboard } from "@frontend/components/visibility/BrandVisibilityDashboard";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

export default async function VisibilityPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const products = await apiGet<ProductOption[]>("/products").catch(() => []);
  const productId = resolved.productId ?? products[0]?.id;
  const visibility = productId
    ? await apiGet<{
        product: { brandName: string } | null;
        summary: {
          totalMentions: number;
          earnedMentions: number;
          ownedMentions: number;
          shareLeader: string;
          shareLeaderMentions: number;
          highIntentMentions: number;
          positiveMentions: number;
          negativeMentions: number;
        } | null;
        shareOfVoice: Array<{ name: string; mentions: number; percentage: number }>;
        sentiment: { positive: number; neutral: number; negative: number };
        intent: { high: number; medium: number; low: number };
        signals: string[];
        mentions: Array<{
          url: string;
          title: string;
          snippet: string;
          source: string;
          sentiment: "positive" | "neutral" | "negative";
          intent: "high" | "medium" | "low";
          visibilityScore: number;
          owned: boolean;
          competitorName?: string | null;
        }>;
      }>(`/visibility?productId=${productId}`).catch(() => ({
        product: null,
        summary: null,
        shareOfVoice: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        intent: { high: 0, medium: 0, low: 0 },
        signals: [],
        mentions: []
      }))
    : {
        product: null,
        summary: null,
        shareOfVoice: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        intent: { high: 0, medium: 0, low: 0 },
        signals: [],
        mentions: []
      };

  return (
    <BrandVisibilityDashboard
      productId={productId}
      products={products}
      visibility={visibility}
    />
  );
}
