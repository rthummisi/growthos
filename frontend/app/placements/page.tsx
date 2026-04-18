import { apiGet } from "@frontend/lib/api";
import { QueueSuggestionButton } from "@frontend/components/actions/QueueSuggestionButton";
import { Card } from "@frontend/components/ui/Card";
import { Badge } from "@frontend/components/ui/Badge";
import { ScoreBar } from "@frontend/components/ui/ScoreBar";

interface PlacementRow {
  id: string;
  type: string;
  title: string;
  viralityScore: number;
  effortScore: number;
  audienceFit: number;
  reasoning: string;
  body: string;
  channel: { name: string; slug: string };
}

export default async function PlacementsPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const query = resolved.productId ? `?productId=${resolved.productId}` : "";
  const data = await apiGet<{ suggestions: PlacementRow[]; total: number }>(`/suggestions${query}`);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.suggestions.slice(0, 8).map((item) => (
        <Card key={item.id} className="space-y-4">
          <div className="flex gap-2">
            <Badge>{item.channel.name}</Badge>
            <Badge>{item.type}</Badge>
          </div>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <div className="space-y-2">
            <ScoreBar value={item.viralityScore} />
            <ScoreBar value={100 - item.effortScore} />
            <ScoreBar value={item.audienceFit} />
          </div>
          <p className="text-sm text-zinc-400">{item.reasoning}</p>
          <QueueSuggestionButton
            productId={resolved.productId}
            channelSlug={item.channel.slug}
            type={item.type}
            title={item.title}
            body={item.body}
            reasoning={item.reasoning}
          />
        </Card>
      ))}
    </div>
  );
}
