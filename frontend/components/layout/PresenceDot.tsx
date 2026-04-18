export function PresenceDot({ status }: { status: "active" | "pending" | "not-present" | "attention" }) {
  const className =
    status === "active"
      ? "bg-emerald-500"
      : status === "pending"
        ? "bg-violet-500"
        : status === "attention"
          ? "bg-amber-500"
          : "bg-zinc-600";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />;
}
