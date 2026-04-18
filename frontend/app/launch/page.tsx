import { LaunchTimeline } from "@frontend/components/timeline/LaunchTimeline";
import { Card } from "@frontend/components/ui/Card";
import { apiGet } from "@frontend/lib/api";

export default async function LaunchPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const query = resolved.productId ? `?productId=${resolved.productId}` : "";
  const data = await apiGet<{
    suggestions: Array<{ id: string; title: string; channel: { name: string } }>;
    total: number;
  }>(`/suggestions${query}`);

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Launch Sequence Planner</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {data.total > 0 ? `${data.total} candidate placements available for sequencing.` : "Generate suggestions first."}
        </p>
      </Card>
      <LaunchTimeline
        items={data.suggestions.map((suggestion) => ({
          id: suggestion.id,
          title: suggestion.title,
          channel: suggestion.channel.name
        }))}
        productId={resolved.productId}
      />
    </div>
  );
}
