import type { InputHTMLAttributes } from "react";

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="checkbox" className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-violet-500" />;
}
