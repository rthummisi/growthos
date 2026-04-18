import type { PropsWithChildren } from "react";
import { cn } from "@frontend/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5", className)}>{children}</div>;
}
