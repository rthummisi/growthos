"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@frontend/components/ui/Badge";
import { apiGet } from "@frontend/lib/api";
import { subscribeToGrowthOSEvents } from "@frontend/lib/sse";
import { useAppStore } from "@frontend/lib/store";
import { cn } from "@frontend/lib/utils";

const items = [
  ["Intake", "/intake"],
  ["Opportunities", "/opportunities"],
  ["Placements", "/placements"],
  ["Approvals", "/approvals"],
  ["Workspace", "/workspace"],
  ["Assets", "/assets"],
  ["Tracking", "/tracking"],
  ["Scheduler", "/scheduler"],
  ["Competitors", "/competitors"],
  ["In the Wild", "/in-the-wild"],
  ["Alerts", "/alerts"],
  ["Launch", "/launch"],
  ["Admin", "/admin"]
] as const;

export function NavClient() {
  const pathname = usePathname();
  const pendingApprovals = useAppStore((state) => state.pendingApprovals);
  const alertsCount = useAppStore((state) => state.alertsCount);
  const setPendingApprovals = useAppStore((state) => state.setPendingApprovals);
  const setAlertsCount = useAppStore((state) => state.setAlertsCount);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const suggestions = await apiGet<{ total: number }>("/suggestions?status=pending");
        const alerts = await apiGet<Array<unknown>>("/alerts");
        setPendingApprovals(suggestions.total);
        setAlertsCount(alerts.length);
      } catch {
        setPendingApprovals(0);
        setAlertsCount(0);
      }
    };

    void loadCounts();
    const unsubscribe = subscribeToGrowthOSEvents((event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          type: string;
          payload?: { pending?: number };
        };
        if (parsed.type === "queue:update" && typeof parsed.payload?.pending === "number") {
          setPendingApprovals(parsed.payload.pending);
        }
        if (parsed.type === "alert:spike") {
          setAlertsCount(useAppStore.getState().alertsCount + 1);
        }
      } catch {
        return;
      }
    });

    return unsubscribe;
  }, [setAlertsCount, setPendingApprovals]);

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950/95 p-4">
      <div className="mb-6">
        <div className="text-xl font-semibold">GrowthOS</div>
        <div className="text-sm text-zinc-400">Growth operations cockpit</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900",
              pathname === href && "bg-zinc-900 text-white"
            )}
          >
            <span>{label}</span>
            {label === "Approvals" ? (
              <Badge className={cn("bg-amber-500/20 text-amber-300", pendingApprovals > 0 && "animate-pulse")}>
                {pendingApprovals}
              </Badge>
            ) : null}
            {label === "Alerts" ? <Badge className="bg-red-500/20 text-red-300">{alertsCount}</Badge> : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
