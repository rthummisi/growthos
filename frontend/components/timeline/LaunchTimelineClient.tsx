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
  slot: string;
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
  productId
}: {
  items: Array<{ id: string; title: string; channel: string }>;
  productId?: string;
}) {
  const [timeline, setTimeline] = useState<LaunchItem[]>(
    items.map((item, index) => ({
      ...item,
      slot: index < 2 ? "-2h" : index < 4 ? "0h" : "+2h"
    }))
  );
  const [saved, setSaved] = useState("");
  const slots = ["-24h", "-2h", "0h", "+2h", "+24h"];

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
        channelSlug: item.channel.toLowerCase().replace(/\s+/g, "-"),
        phase: item.slot === "-24h" ? "awareness" : item.slot === "0h" ? "consideration" : "conversion",
        scheduledAt: new Date().toISOString(),
        suggestionId: item.id
      }))
    });
    setSaved("Saved");
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Launch Sequence Planner</h2>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-sm text-emerald-400">{saved}</span> : null}
          <Button disabled={!productId} onClick={() => void saveTimeline()}>Save Timeline</Button>
        </div>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid gap-3 md:grid-cols-5">
          {slots.map((slot) => (
            <DropSlot key={slot} slot={slot} items={timeline.filter((item) => item.slot === slot)} />
          ))}
        </div>
      </DndContext>
    </Card>
  );
}
