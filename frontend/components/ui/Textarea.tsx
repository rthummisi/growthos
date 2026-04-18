import type { TextareaHTMLAttributes } from "react";
import { cn } from "@frontend/lib/utils";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm", props.className)} />;
}
