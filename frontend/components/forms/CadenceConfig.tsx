 "use client";

import { useState } from "react";
import { apiPatch } from "@frontend/lib/api";
import { Button } from "@frontend/components/ui/Button";
import { Card } from "@frontend/components/ui/Card";
import { Select } from "@frontend/components/ui/Select";
import { Toggle } from "@frontend/components/ui/Toggle";

interface ChannelRow {
  slug: string;
  name: string;
  cadence: string;
  active: boolean;
}

function nextRunLabel(cadence: string) {
  const hours =
    cadence === "twice-daily" ? 12 : cadence === "weekly" ? 24 * 7 : cadence === "per-launch-only" ? 0 : 24;
  if (hours === 0) {
    return "launch-triggered";
  }
  return `${hours}h`;
}

export function CadenceConfig({ channels }: { channels: ChannelRow[] }) {
  const [rows, setRows] = useState(channels);

  const updateRow = (slug: string, patch: Partial<ChannelRow>) => {
    setRows((current) => current.map((row) => (row.slug === slug ? { ...row, ...patch } : row)));
  };

  const save = async (row: ChannelRow) => {
    await apiPatch("/scheduler", {
      channelSlug: row.slug,
      cadence: row.cadence,
      active: row.active
    });
  };

  const bulkSetDaily = () => {
    setRows((current) => current.map((row) => ({ ...row, cadence: "daily" })));
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Channel Cadence</h2>
        <Button onClick={bulkSetDaily}>Bulk set all daily</Button>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.slug} className="grid items-center gap-3 rounded-xl border border-zinc-800 p-4 md:grid-cols-[1fr_180px_100px_80px_100px]">
            <div>
              <div className="font-medium">{row.name}</div>
              <div className="text-xs text-zinc-400">{row.slug}</div>
            </div>
            <Select value={row.cadence} onChange={(event) => updateRow(row.slug, { cadence: event.target.value })}>
              <option value="daily">daily</option>
              <option value="twice-daily">twice-daily</option>
              <option value="weekly">weekly</option>
              <option value="per-launch-only">per-launch-only</option>
            </Select>
            <div className="text-sm text-zinc-400">{nextRunLabel(row.cadence)}</div>
            <button type="button" onClick={() => updateRow(row.slug, { active: !row.active })}>
              <Toggle enabled={row.active} />
            </button>
            <Button onClick={() => void save(row)}>Save</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
