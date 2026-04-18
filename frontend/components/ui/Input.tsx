import type { InputHTMLAttributes } from "react";
import { cn } from "@frontend/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm", props.className)} />;
}
