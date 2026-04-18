import { Card } from "@frontend/components/ui/Card";

export function ViralSpikeGraph() {
  const bars = [8, 12, 14, 18, 36, 72, 94];
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Spike Graph</h2>
      <div className="flex h-40 items-end gap-2">
        {bars.map((value, index) => (
          <div key={value + index} className="flex-1 rounded-t bg-violet-500/70" style={{ height: `${value}%` }} />
        ))}
      </div>
    </Card>
  );
}
