import { apiGet } from "@frontend/lib/api";
import { PlaybookDashboard } from "@frontend/components/playbook/PlaybookDashboard";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

interface PlaybookPayload {
  product: ProductOption | null;
  summary: {
    bestChannel: string | null;
    topRoi: number;
    liveOpportunityScore: number;
    channelsMeasured: number;
    lastMetricAt: string | null;
  } | null;
  recommendations: Array<{
    id: string;
    title: string;
    summary: string;
    rationale: string;
    impact: "high" | "medium" | "low";
    actionLabel: string;
  }>;
}

export default async function PlaybookPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const products = await apiGet<ProductOption[]>("/products").catch(() => []);
  const productId = resolved.productId ?? products[0]?.id;
  const playbook = productId
    ? await apiGet<PlaybookPayload>(`/playbook?productId=${productId}`).catch(() => ({
        product: null,
        summary: null,
        recommendations: []
      }))
    : { product: null, summary: null, recommendations: [] };

  return (
    <PlaybookDashboard
      productId={productId}
      products={products}
      summary={playbook.summary}
      recommendations={playbook.recommendations}
    />
  );
}
