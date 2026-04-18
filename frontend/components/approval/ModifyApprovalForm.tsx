"use client";

import { useState } from "react";
import { apiPost } from "@frontend/lib/api";
import { Button } from "@frontend/components/ui/Button";
import { DiffPreview } from "@frontend/components/approval/DiffPreview";
import { Textarea } from "@frontend/components/ui/Textarea";

export function ModifyApprovalForm({
  suggestionId,
  initialBody,
  onSaved
}: {
  suggestionId: string;
  initialBody: string;
  onSaved: () => void;
}) {
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await apiPost("/approvals", {
      suggestionId,
      decision: "approved",
      modifiedBody: body
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <Textarea rows={8} value={body} onChange={(event) => setBody(event.target.value)} />
      <DiffPreview original={initialBody} modified={body} />
      <div className="flex justify-end">
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? "Saving..." : "Save & Approve"}
        </Button>
      </div>
    </div>
  );
}
