import { apiGet } from "@frontend/lib/api";
import { QueueSuggestionButton } from "@frontend/components/actions/QueueSuggestionButton";
import { Card } from "@frontend/components/ui/Card";
import { ViralSpikeGraph } from "@frontend/components/charts/ViralSpikeGraph";

export default async function AlertsPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const alerts = await apiGet<
    Array<{
      suggestionId: string;
      channel: string;
      metric: string;
      currentValue: number;
      baseline: number;
      rapidResponseOptions: string[];
    }>
  >("/alerts");

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.suggestionId} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Viral Alert</h1>
              <p className="text-sm text-zinc-400">
                {alert.channel} {alert.metric}: {alert.baseline} to {alert.currentValue}
              </p>
            </div>
            <QueueSuggestionButton
              productId={resolved.productId}
              channelSlug={alert.channel}
              type="community-post"
              title={`Respond to ${alert.channel} spike`}
              body={alert.rapidResponseOptions[0] ?? "Respond to the spike with follow-up content."}
              reasoning={`Rapid response to ${alert.channel} spike on ${alert.metric}.`}
            />
          </div>
          <ViralSpikeGraph />
          <div className="grid gap-2">
            {alert.rapidResponseOptions.map((option) => (
              <div key={option} className="rounded-xl border border-zinc-800 p-3 text-sm text-zinc-300">
                {option}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
