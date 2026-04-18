export function Toast({ title, body }: { title: string; body: string }) {
  return (
    <div className="fixed right-4 top-4 z-50 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-zinc-400">{body}</div>
    </div>
  );
}
