import { Card } from "@frontend/components/ui/Card";
import { QueueSuggestionButton } from "@frontend/components/actions/QueueSuggestionButton";

export function InTheWildFeed({
  items,
  productId
}: {
  items: Array<{ source: string; title: string; matchReason: string; draftReply: string; url: string }>;
  productId?: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.url} className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">{item.source}</div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{item.matchReason}</p>
            <p className="mt-2 text-xs text-zinc-500">{item.draftReply}</p>
          </div>
          <QueueSuggestionButton
            productId={productId}
            channelSlug={item.source.toLowerCase() === "stack overflow" ? "stackoverflow" : item.source.toLowerCase()}
            type="answer-reply"
            title={item.title}
            body={item.draftReply}
            reasoning={item.matchReason}
          />
        </Card>
      ))}
    </div>
  );
}
