import { cn } from "@frontend/lib/utils";

export function ScoreBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-zinc-800", className)}>
      <div
        className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
