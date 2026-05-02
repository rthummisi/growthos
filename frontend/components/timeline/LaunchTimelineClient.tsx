"use client";

import { useState } from "react";
import { closestCenter, DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { apiPost } from "@frontend/lib/api";
import { Button } from "@frontend/components/ui/Button";
import { Card } from "@frontend/components/ui/Card";

interface LaunchItem {
  id: string;
  title: string;
  channel: string;
  channelSlug: string;
  slot: string;
}

const slots = ["-24h", "-2h", "0h", "+2h", "+24h"];
const slotOffsets: Record<string, number> = {
  "-24h": -24,
  "-2h": -2,
  "0h": 0,
  "+2h": 2,
  "+24h": 24
};

function buildLaunchBaseDate() {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(9, 0, 0, 0);
  if (base.getTime() <= Date.now()) {
    base.setDate(base.getDate() + 1);
  }
  return base;
}

function phaseForSlot(slot: string) {
  if (slot === "-24h") return "awareness";
  if (slot === "-2h" || slot === "0h") return "consideration";
  return "conversion";
}

function defaultSlotForChannel(channelSlug: string) {
  if (channelSlug === "producthunt" || channelSlug === "hackernews" || channelSlug === "twitter" || channelSlug === "reddit") {
    return "0h";
  }
  if (channelSlug === "github" || channelSlug === "devto" || channelSlug === "linkedin") {
    return "-2h";
  }
  if (channelSlug === "newsletter" || channelSlug === "indiehackers" || channelSlug === "bluesky") {
    return "+2h";
  }
  return "+24h";
}

function slotFromCalendarPhase(phase: string) {
  if (phase === "awareness") return "-24h";
  if (phase === "consideration") return "0h";
  return "+24h";
}

function DraggablePill({ item }: { item: LaunchItem }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="rounded-full bg-violet-500/20 px-3 py-2 text-xs text-violet-200"
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
      }}
    >
      {item.channel}: {item.title}
    </div>
  );
}

function DropSlot({
  slot,
  items
}: {
  slot: string;
  items: LaunchItem[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-28 rounded-xl border p-3 ${isOver ? "border-violet-500 bg-violet-500/10" : "border-zinc-800 bg-zinc-950"}`}
    >
      <div className="mb-3 text-xs text-zinc-400">{slot}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <DraggablePill key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function LaunchTimelineClient({
  items,
  initialEntries,
  productId
}: {
  items: Array<{ id: string; title: string; channel: string; channelSlug: string }>;
  initialEntries: Array<{ suggestionId?: string; channelSlug: string; phase: string; scheduledAt: string }>;
  productId?: string;
}) {
  const [launchBase] = useState(() => buildLaunchBaseDate());
  const [timeline, setTimeline] = useState<LaunchItem[]>(
    items.map((item) => {
      const existingEntry =
        initialEntries.find((entry) => entry.suggestionId === item.id) ??
        initialEntries.find((entry) => entry.channelSlug === item.channelSlug);

      return {
        ...item,
        slot: existingEntry ? slotFromCalendarPhase(existingEntry.phase) : defaultSlotForChannel(item.channelSlug)
      };
    })
  );
  const [saved, setSaved] = useState("");

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      return;
    }
    setTimeline((current) =>
      current.map((item) =>
        item.id === String(event.active.id) ? { ...item, slot: String(event.over?.id) } : item
      )
    );
  };

  const saveTimeline = async () => {
    if (!productId) {
      return;
    }
    await apiPost("/calendar", {
      productId,
      entries: timeline.map((item) => ({
        channelSlug: item.channelSlug,
        phase: phaseForSlot(item.slot),
        scheduledAt: new Date(launchBase.getTime() + slotOffsets[item.slot] * 60 * 60 * 1000).toISOString(),
        suggestionId: item.id
      }))
    });
    setSaved("Saved");
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Launch Sequence Planner</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Core launch window starts {launchBase.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-sm text-emerald-400">{saved}</span> : null}
          <Button disabled={!productId} onClick={() => void saveTimeline()}>Save Timeline</Button>
        </div>
      </div>
      {timeline.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
          Approve placements first. Launch sequencing is intentionally approval-gated.
        </div>
      ) : null}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid gap-3 md:grid-cols-5">
          {slots.map((slot) => (
            <div key={slot} className="space-y-2">
              <div className="px-1 text-xs text-zinc-500">
                {new Date(launchBase.getTime() + slotOffsets[slot] * 60 * 60 * 1000).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </div>
              <DropSlot slot={slot} items={timeline.filter((item) => item.slot === slot)} />
            </div>
          ))}
        </div>
      </DndContext>
    </Card>
  );
}
