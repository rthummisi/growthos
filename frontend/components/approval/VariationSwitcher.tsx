import { Button } from "@frontend/components/ui/Button";

export function VariationSwitcher({
  index,
  total,
  onPrevious,
  onNext
}: {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-300">
      <Button variant="ghost" onClick={onPrevious}>Previous</Button>
      <span>
        Variation {index + 1} / {total}
      </span>
      <Button variant="ghost" onClick={onNext}>Next</Button>
    </div>
  );
}
