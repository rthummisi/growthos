"use client";

import { useState } from "react";
import { VariationSwitcher } from "@frontend/components/approval/VariationSwitcher";
import { apiPut } from "@frontend/lib/api";
import { Button } from "@frontend/components/ui/Button";
import { Card } from "@frontend/components/ui/Card";

export function AssetEditor({
  assets
}: {
  assets: Array<{ id: string; title: string; content: string; type: string; variationOf?: string | null }>;
}) {
  const [assetIndex, setAssetIndex] = useState(0);
  const activeAsset = assets[assetIndex];
  const totalAssets = Math.max(assets.length, 1);
  const [content, setContent] = useState(activeAsset?.content ?? "");
  const [status, setStatus] = useState("");

  const save = async () => {
    if (!activeAsset) {
      return;
    }
    await apiPut(`/assets/${activeAsset.id}`, { content });
    setStatus("Saved");
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Asset Studio</h2>
        <div className="flex items-center gap-3">
          {status ? <span className="text-sm text-emerald-400">{status}</span> : null}
          <Button disabled={!activeAsset} onClick={() => void navigator.clipboard.writeText(content)}>
            Copy to Clipboard
          </Button>
          <Button disabled={!activeAsset} onClick={() => void save()}>
            Save
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <VariationSwitcher
          index={assetIndex}
          total={totalAssets}
          onPrevious={() => {
            const nextIndex = (assetIndex - 1 + totalAssets) % totalAssets;
            setAssetIndex(nextIndex);
            setContent(assets[nextIndex]?.content ?? "");
          }}
          onNext={() => {
            const nextIndex = (assetIndex + 1) % totalAssets;
            setAssetIndex(nextIndex);
            setContent(assets[nextIndex]?.content ?? "");
          }}
        />
      </div>
      <textarea
        className="min-h-[420px] w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Select or generate an asset to begin editing."
      />
    </Card>
  );
}
