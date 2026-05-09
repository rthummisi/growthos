import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { cn } from "@frontend/lib/utils";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentPropsWithoutRef<"div">>) {
  return (
    <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5", className)} {...props}>
      {children}
    </div>
  );
}
