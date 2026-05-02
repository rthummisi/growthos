import { LaunchTimelineClient } from "@frontend/components/timeline/LaunchTimelineClient";

export function LaunchTimeline({
  items,
  initialEntries,
  productId
}: {
  items: Array<{ id: string; title: string; channel: string; channelSlug: string }>;
  initialEntries: Array<{ suggestionId?: string; channelSlug: string; phase: string; scheduledAt: string }>;
  productId?: string;
}) {
  return <LaunchTimelineClient items={items} initialEntries={initialEntries} productId={productId} />;
}
