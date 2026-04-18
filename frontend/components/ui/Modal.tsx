import type { PropsWithChildren } from "react";
import { cn } from "@frontend/lib/utils";

export function Modal({
  open,
  children,
  className
}: PropsWithChildren<{ open: boolean; className?: string }>) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className={cn("w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6", className)}>{children}</div>
    </div>
  );
}
