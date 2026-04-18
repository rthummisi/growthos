import { cn } from "@frontend/lib/utils";

export function Badge({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200", className)}>
      {children}
    </span>
  );
}
