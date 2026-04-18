import type { InputHTMLAttributes } from "react";

export function Slider(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="range" className="w-full accent-violet-500" />;
}
