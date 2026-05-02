import { apiGet } from "@frontend/lib/api";
import { TrackingDashboard } from "@frontend/components/tracking/TrackingDashboard";

interface TrackingRow {
  channelSlug?: string;
  channelName?: string;
  clicks?: number;
  signups?: number;
  activations?: number;
  clickToSignupRate?: number;
  signupToActivationRate?: number;
  activationRate?: number;
  roi?: number;
  lastTouchAt?: string;
}

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
      initialUtm={utmData as TrackingRow[]}
    />
  );
}
