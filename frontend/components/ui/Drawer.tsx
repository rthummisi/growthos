import type { PropsWithChildren } from "react";
import { cn } from "@frontend/lib/utils";

export function Drawer({
  open,
  children,
  className
}: PropsWithChildren<{ open: boolean; className?: string }>) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-50 h-screen w-full max-w-xl border-l border-zinc-800 bg-zinc-950 p-6 transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      {children}
    </div>
  );
}
