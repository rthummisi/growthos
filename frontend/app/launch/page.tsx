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
  const statusQuery = query ? `${query}&status=approved` : "?status=approved";
  const pendingQuery = query ? `${query}&status=pending` : "?status=pending";
  const [approved, pending, calendar] = await Promise.all([
    apiGet<{
      suggestions: Array<{ id: string; title: string; channel: { name: string; slug: string } }>;
      total: number;
    }>(`/suggestions${statusQuery}`),
    apiGet<{ total: number }>(`/suggestions${pendingQuery}`),
    resolved.productId
      ? apiGet<Array<{ suggestionId?: string; channelSlug: string; phase: string; scheduledAt: string }>>(`/calendar${query}`)
      : Promise.resolve([])
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Launch Sequence Planner</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {approved.total > 0
            ? `${approved.total} approved placements are ready for sequencing.`
            : pending.total > 0
              ? `No approved placements yet. ${pending.total} items are still waiting in approvals.`
              : "Generate suggestions first."}
        </p>
      </Card>
      <LaunchTimeline
        items={approved.suggestions.map((suggestion) => ({
          id: suggestion.id,
          title: suggestion.title,
          channel: suggestion.channel.name,
          channelSlug: suggestion.channel.slug
        }))}
        initialEntries={calendar}
        productId={resolved.productId}
      />
    </div>
  );
}
