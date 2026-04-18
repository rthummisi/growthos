import { apiGet } from "@frontend/lib/api";
import { CalendarArcView } from "@frontend/components/charts/CalendarArcView";
import { CadenceConfig } from "@frontend/components/forms/CadenceConfig";

export default async function SchedulerPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const channels = await apiGet<Array<{ slug: string; name: string; cadence: string; active: boolean }>>("/scheduler");
  const calendar = resolved.productId
    ? await apiGet<Array<{ id: string; channelSlug: string; phase: string; scheduledAt: string }>>(
        `/calendar?productId=${resolved.productId}`
      )
    : [];

  return (
    <div className="space-y-6">
      <CadenceConfig channels={channels} />
      <CalendarArcView items={calendar} />
    </div>
  );
}
