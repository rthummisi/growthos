import { Fragment } from "react";
import { Card } from "@frontend/components/ui/Card";

export function CompetitorHeatmap() {
  const rows = ["Competitor A", "Competitor B", "You"];
  const cols = ["GitHub", "HN", "Reddit", "X"];
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Competitor Gap Heatmap</h2>
      <div className="grid grid-cols-5 gap-2 text-xs">
        <div />
        {cols.map((col) => (
          <div key={col} className="text-zinc-400">{col}</div>
        ))}
        {rows.map((row) => (
          <Fragment key={row}>
            <div key={`${row}-label`} className="text-zinc-400">{row}</div>
            {cols.map((col) => (
              <div key={`${row}-${col}`} className="h-10 rounded bg-emerald-500/20" />
            ))}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}
