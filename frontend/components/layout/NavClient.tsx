"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Badge } from "@frontend/components/ui/Badge";
import { ProductTour } from "@frontend/components/demo/ProductTour";
import { TOUR_STEPS } from "@frontend/components/demo/tourSteps";
import { apiGet } from "@frontend/lib/api";
import { subscribeToGrowthOSEvents } from "@frontend/lib/sse";
import { useAppStore } from "@frontend/lib/store";
import { cn } from "@frontend/lib/utils";

const items = [
  ["Intake", "/intake" as Route],
  ["Opportunities", "/opportunities" as Route],
  ["Placements", "/placements" as Route],
  ["Approvals", "/approvals" as Route],
  ["Workspace", "/workspace" as Route],
  ["Assets", "/assets" as Route],
  ["Playbook", "/playbook" as Route],
  ["Tracking", "/tracking" as Route],
  ["Scheduler", "/scheduler" as Route],
  ["Competitors", "/competitors" as Route],
  ["Visibility", "/visibility" as Route],
  ["In the Wild", "/in-the-wild" as Route],
  ["Alerts", "/alerts" as Route],
  ["Launch", "/launch" as Route],
  ["Admin", "/admin" as Route]
] as const;

export function NavClient() {
  const pathname = usePathname();
  const pendingApprovals = useAppStore((state) => state.pendingApprovals);
  const alertsCount = useAppStore((state) => state.alertsCount);
  const setPendingApprovals = useAppStore((state) => state.setPendingApprovals);
  const setAlertsCount = useAppStore((state) => state.setAlertsCount);
  const [tourActive, setTourActive] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState<string | null>(null);

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

  // Track which nav label the active tour step highlights
  useEffect(() => {
    if (!tourActive) { setActiveTourStep(null); return; }
    // activeTourStep is updated by the tour via pathname changes
    const step = TOUR_STEPS.find((s) => s.page === pathname);
    setActiveTourStep(step?.navLabel ?? null);
  }, [pathname, tourActive]);

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950/95 p-4 z-50">
        <div className="mb-6">
          <div className="text-xl font-semibold">GrowthOS</div>
          <div className="text-sm text-zinc-400">Growth operations cockpit</div>
        </div>

        {/* Tour button — above Intake */}
        <ProductTour
          activeStep={activeTourStep}
          onStart={() => setTourActive(true)}
          onEnd={() => { setTourActive(false); setActiveTourStep(null); }}
        />

        <nav className="flex flex-1 flex-col gap-1">
          {items.map(([label, href]) => {
            const isTourHighlight = tourActive && activeTourStep === label;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900",
                  pathname === href && "bg-zinc-900 text-white",
                  isTourHighlight && "ring-2 ring-violet-500 bg-violet-500/10 text-violet-200"
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
            );
          })}
        </nav>
      </aside>
    </>
  );
}
