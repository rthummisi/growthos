import { Card } from "@frontend/components/ui/Card";

export default function VisibilityLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-52 rounded bg-zinc-800" />
            <div className="h-4 w-96 rounded bg-zinc-800" />
          </div>
          <div className="h-10 w-72 rounded bg-zinc-800" />
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950/70 space-y-2">
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="h-7 w-16 rounded bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-800" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-4">
            <div className="h-6 w-36 rounded bg-zinc-800" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-4 w-full rounded bg-zinc-800" />
                  <div className="h-2 w-full rounded-full bg-zinc-800" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-6 w-36 rounded bg-zinc-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-5 w-16 rounded-full bg-zinc-800" />
                ))}
              </div>
              <div className="h-5 w-3/4 rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-800" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
