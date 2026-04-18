import { LaunchTimelineClient } from "@frontend/components/timeline/LaunchTimelineClient";

export function LaunchTimeline({
  items,
  productId
}: {
  items: Array<{ id: string; title: string; channel: string }>;
  productId?: string;
}) {
  return <LaunchTimelineClient items={items} productId={productId} />;
}
