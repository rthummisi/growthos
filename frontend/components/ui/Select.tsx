import type { SelectHTMLAttributes } from "react";
import { cn } from "@frontend/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm", props.className)} />;
}
