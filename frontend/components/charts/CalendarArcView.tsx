import { Card } from "@frontend/components/ui/Card";

export function CalendarArcView({
  items
}: {
  items: Array<{ id: string; channelSlug: string; phase: string; scheduledAt: string }>;
}) {
  const lanes = ["awareness", "consideration", "conversion"] as const;

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Calendar Arc</h2>
      <div className="grid gap-4">
        {lanes.map((lane) => (
          <div key={lane}>
            <div className="mb-2 text-sm capitalize text-zinc-400">{lane}</div>
            <div className="flex min-h-12 flex-wrap gap-2 rounded-xl bg-zinc-950 p-3">
              {items
                .filter((item) => item.phase === lane)
                .map((item) => (
                  <div key={item.id} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">
                    {item.channelSlug}
                  </div>
                ))}
              {items.filter((item) => item.phase === lane).length === 0 ? (
                <div className="text-xs text-zinc-500">No scheduled items</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
