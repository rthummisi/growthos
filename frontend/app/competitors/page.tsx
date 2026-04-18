import { apiGet } from "@frontend/lib/api";
import { CompetitorHeatmap } from "@frontend/components/charts/CompetitorHeatmap";
import { Card } from "@frontend/components/ui/Card";

export default async function CompetitorsPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const query = resolved.productId ? `?productId=${resolved.productId}` : "";
  const data = resolved.productId
    ? await apiGet<{
        competitors: Array<{ name: string }>;
        gaps: Array<{ channelSlug: string; competitorScore: number; yourScore: number; priority: string }>;
      }>(`/competitors${query}`)
    : { competitors: [], gaps: [] };

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Competitor Intelligence</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {data.gaps.length > 0
            ? `${data.gaps.length} ranked channel gaps identified.`
            : "Submit a product first to generate competitor gaps."}
        </p>
      </Card>
      <CompetitorHeatmap />
      <Card>
        <div className="space-y-3">
          {data.gaps.map((gap) => (
            <div key={gap.channelSlug} className="flex items-center justify-between rounded-xl border border-zinc-800 p-4">
              <div>
                <div className="font-medium">{gap.channelSlug}</div>
                <div className="text-sm text-zinc-400">Priority: {gap.priority}</div>
              </div>
              <div className="text-sm text-zinc-300">
                competitor {gap.competitorScore} / you {gap.yourScore}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
