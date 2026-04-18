export function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className={`flex h-6 w-11 items-center rounded-full p-1 ${enabled ? "bg-emerald-500" : "bg-zinc-700"}`}>
      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
    </div>
  );
}
