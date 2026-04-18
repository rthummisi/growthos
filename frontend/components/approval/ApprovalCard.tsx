"use client";

import { useState } from "react";
import { Card } from "@frontend/components/ui/Card";
import { Button } from "@frontend/components/ui/Button";
import { Badge } from "@frontend/components/ui/Badge";
import { Checkbox } from "@frontend/components/ui/Checkbox";
import { ModifyApprovalForm } from "@frontend/components/approval/ModifyApprovalForm";
import { VariationSwitcher } from "@frontend/components/approval/VariationSwitcher";
import { apiPost } from "@frontend/lib/api";

interface ApprovalCardProps {
  suggestionId: string;
  channel: string;
  type: string;
  title: string;
  reasoning: string;
  assets: string[];
  selected: boolean;
  onToggleSelected: () => void;
  onResolved: () => void;
}

export function ApprovalCard({
  suggestionId,
  channel,
  type,
  title,
  reasoning,
  assets,
  selected,
  onToggleSelected,
  onResolved
}: ApprovalCardProps) {
  const [status, setStatus] = useState("pending");
  const [showModify, setShowModify] = useState(false);
  const [assetIndex, setAssetIndex] = useState(0);
  const totalAssets = Math.max(assets.length, 1);
  const currentAsset = assets[assetIndex] ?? assets[0] ?? title;

  const decide = async (decision: "approved" | "rejected" | "deferred") => {
    await apiPost("/approvals", { suggestionId, decision });
    setStatus(decision);
    setShowModify(false);
    onResolved();
  };

  return (
    <Card className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox checked={selected} onChange={onToggleSelected} />
          <Badge>{channel}</Badge>
          <Badge>{type}</Badge>
          <Badge className="bg-zinc-700 text-zinc-100">{status}</Badge>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-zinc-300">{reasoning}</p>
        <VariationSwitcher
          index={assetIndex}
          total={totalAssets}
          onPrevious={() => setAssetIndex((current) => (current - 1 + totalAssets) % totalAssets)}
          onNext={() => setAssetIndex((current) => (current + 1) % totalAssets)}
        />
        {showModify ? (
          <ModifyApprovalForm
            suggestionId={suggestionId}
            initialBody={currentAsset}
            onSaved={() => {
              setStatus("approved");
              setShowModify(false);
              onResolved();
            }}
          />
        ) : null}
        <div className="flex gap-2">
          <Button variant="approve" onClick={() => void decide("approved")}>Approve</Button>
          <Button onClick={() => setShowModify((current) => !current)}>Modify</Button>
          <Button onClick={() => void decide("deferred")}>Defer</Button>
          <Button variant="reject" onClick={() => void decide("rejected")}>Reject</Button>
        </div>
      </div>
      <pre className="overflow-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-300">{currentAsset}</pre>
    </Card>
  );
}
