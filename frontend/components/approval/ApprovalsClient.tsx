"use client";

import { useMemo, useState } from "react";
import { apiPost } from "@frontend/lib/api";
import { ApprovalCard } from "@frontend/components/approval/ApprovalCard";
import { BulkActionBar } from "@frontend/components/approval/BulkActionBar";

interface SuggestionRow {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  channel: { name: string };
  assets: Array<{ content: string }>;
}

export function ApprovalsClient({ initialSuggestions }: { initialSuggestions: SuggestionRow[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedCount = selectedIds.length;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelection = (suggestionId: string) => {
    setSelectedIds((current) =>
      current.includes(suggestionId)
        ? current.filter((id) => id !== suggestionId)
        : [...current, suggestionId]
    );
  };

  const bulkDecide = async (decision: "approved" | "rejected" | "deferred") => {
    for (const suggestionId of selectedIds) {
      await apiPost("/approvals", { suggestionId, decision });
    }
    setSuggestions((current) => current.filter((suggestion) => !selectedSet.has(suggestion.id)));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      <BulkActionBar
        selectedCount={selectedCount}
        onApproveAll={() => void bulkDecide("approved")}
        onRejectAll={() => void bulkDecide("rejected")}
        onDeferAll={() => void bulkDecide("deferred")}
      />
      {suggestions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
          No pending approvals yet.
        </div>
      ) : (
        suggestions.map((suggestion) => (
          <ApprovalCard
            key={suggestion.id}
            suggestionId={suggestion.id}
            channel={suggestion.channel.name}
            type={suggestion.type}
            title={suggestion.title}
            reasoning={suggestion.reasoning}
            assets={suggestion.assets.map((asset) => asset.content)}
            selected={selectedSet.has(suggestion.id)}
            onToggleSelected={() => toggleSelection(suggestion.id)}
            onResolved={() => {
              setSuggestions((current) => current.filter((entry) => entry.id !== suggestion.id));
              setSelectedIds((current) => current.filter((id) => id !== suggestion.id));
            }}
          />
        ))
      )}
    </div>
  );
}
