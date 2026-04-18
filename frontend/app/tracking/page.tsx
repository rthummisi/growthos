import { apiGet } from "@frontend/lib/api";
import { TrackingDashboard } from "@frontend/components/tracking/TrackingDashboard";

export default async function TrackingPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const { productId } = resolved;
  const query = productId ? `?productId=${productId}` : "";

  const [metrics, utmData] = await Promise.all([
    productId ? apiGet<Array<Record<string, unknown>>>(`/metrics${query}`) : Promise.resolve([]),
    productId ? apiGet<Array<Record<string, unknown>>>(`/utm/report${query}`) : Promise.resolve([])
  ]);

  return (
    <TrackingDashboard
      productId={productId}
      initialMetrics={metrics}
      initialUtm={utmData as Array<{ channelSlug?: string; clicks?: number; signups?: number; activations?: number }>}
    />
  );
}
