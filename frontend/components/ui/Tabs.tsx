"use client";

export function Tabs({
  tabs,
  active,
  onChange
}: {
  tabs: string[];
  active: string;
  onChange?: (tab: string) => void;
}) {
  return (
    <div className="flex gap-2 border-b border-zinc-800">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`border-b-2 px-3 py-2 text-sm ${tab === active ? "border-violet-500 text-white" : "border-transparent text-zinc-400"}`}
          type="button"
          onClick={() => onChange?.(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
