import { apiGet } from "@frontend/lib/api";
import { InTheWildFeed } from "@frontend/components/feed/InTheWildFeed";
import { Card } from "@frontend/components/ui/Card";

export default async function InTheWildPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const items = await apiGet<
    Array<{ source: string; url: string; title: string; matchReason: string; draftReply: string }>
  >("/in-the-wild");

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">In The Wild</h1>
        <p className="mt-2 text-sm text-zinc-400">{items.length} live opportunities available.</p>
      </Card>
      <InTheWildFeed items={items} productId={resolved.productId} />
    </div>
  );
}
