"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@frontend/lib/utils";

const variants = {
  primary: "bg-accent text-white hover:bg-violet-400",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  ghost: "bg-transparent text-zinc-200 hover:bg-zinc-900",
  danger: "bg-reject text-white hover:bg-red-400",
  approve: "bg-approve text-white hover:bg-emerald-400",
  reject: "bg-reject text-white hover:bg-red-400"
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }>) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
