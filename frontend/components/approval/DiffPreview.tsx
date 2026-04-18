"use client";

function buildDiff(original: string, modified: string) {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  const max = Math.max(originalLines.length, modifiedLines.length);
  return Array.from({ length: max }, (_, index) => ({
    original: originalLines[index] ?? "",
    modified: modifiedLines[index] ?? "",
    changed: (originalLines[index] ?? "") !== (modifiedLines[index] ?? "")
  }));
}

export function DiffPreview({
  original,
  modified
}: {
  original: string;
  modified: string;
}) {
  const rows = buildDiff(original, modified);
  return (
    <div className="max-h-64 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs">
      {rows.map((row, index) => (
        <div
          key={`${index}-${row.original}-${row.modified}`}
          className={row.changed ? "bg-amber-500/10 text-amber-100" : "text-zinc-400"}
        >
          {row.modified || " "}
        </div>
      ))}
    </div>
  );
}
