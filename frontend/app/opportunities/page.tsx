import { apiGet } from "@frontend/lib/api";
import { Card } from "@frontend/components/ui/Card";
import { CompetitorHeatmap } from "@frontend/components/charts/CompetitorHeatmap";
import { PresenceDot } from "@frontend/components/layout/PresenceDot";
import { ScoreBar } from "@frontend/components/ui/ScoreBar";

interface SuggestionRow {
  id: string;
  title: string;
  audienceFit: number;
  channel: { name: string };
}

export default async function OpportunitiesPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const query = resolved.productId ? `?productId=${resolved.productId}` : "";
  const data = await apiGet<{ suggestions: SuggestionRow[]; total: number }>(`/suggestions${query}`);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold">Opportunities</h1>
        {data.suggestions.slice(0, 10).map((suggestion) => (
          <div key={suggestion.id} className="rounded-xl border border-zinc-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PresenceDot status="pending" />
                {suggestion.channel.name}
              </span>
              <span>{suggestion.audienceFit}</span>
            </div>
            <ScoreBar value={suggestion.audienceFit} />
            <p className="mt-3 text-sm text-zinc-400">{suggestion.title}</p>
          </div>
        ))}
      </Card>
      <CompetitorHeatmap />
    </div>
  );
}
