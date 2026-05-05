import { apiGet } from "@frontend/lib/api";
import { BrandVisibilityDashboard } from "@frontend/components/visibility/BrandVisibilityDashboard";
import type { VisibilityResult } from "@shared/types/visibility.types";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

const EMPTY: VisibilityResult = {
  product: null,
  summary: null,
  shareOfVoice: [],
  sentiment: { positive: 0, neutral: 0, negative: 0 },
  intent: { high: 0, medium: 0, low: 0 },
  signals: [],
  mentions: [],
  cachedAt: null,
  trend: []
};

export default async function VisibilityPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const products = await apiGet<ProductOption[]>("/products").catch(() => []);
  const productId = resolved.productId ?? products[0]?.id;
  const visibility = productId
    ? await apiGet<VisibilityResult>(`/visibility?productId=${productId}`).catch(() => EMPTY)
    : EMPTY;

  return (
    <BrandVisibilityDashboard
      productId={productId}
      products={products}
      visibility={visibility}
    />
  );
}
