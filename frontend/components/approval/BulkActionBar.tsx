import { Card } from "@frontend/components/ui/Card";
import { Button } from "@frontend/components/ui/Button";

export function BulkActionBar({
  selectedCount,
  onApproveAll,
  onRejectAll,
  onDeferAll
}: {
  selectedCount: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onDeferAll: () => void;
}) {
  return (
    <Card className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{selectedCount} selected</span>
      <div className="flex gap-2">
        <Button variant="approve" disabled={selectedCount === 0} onClick={onApproveAll}>Approve All</Button>
        <Button disabled={selectedCount === 0} onClick={onDeferAll}>Defer All</Button>
        <Button variant="danger" disabled={selectedCount === 0} onClick={onRejectAll}>Reject All</Button>
      </div>
    </Card>
  );
}
