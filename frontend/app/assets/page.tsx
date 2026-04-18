import { AssetEditor } from "@frontend/components/forms/AssetEditor";
import { Card } from "@frontend/components/ui/Card";
import { apiGet } from "@frontend/lib/api";

interface AssetRow {
  id: string;
  title: string;
  type: string;
  content: string;
  variationOf?: string | null;
}

export default async function AssetsPage({
  searchParams
}: {
  searchParams?: Promise<{ suggestionId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const query = resolved.suggestionId ? `?suggestionId=${resolved.suggestionId}` : "";
  const assets = await apiGet<AssetRow[]>(`/assets${query}`);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Asset List</h1>
        <div className="space-y-2 text-sm text-zinc-300">
          {assets.length === 0 ? <div className="text-zinc-400">No assets available.</div> : null}
          {assets.map((asset) => (
            <div key={asset.id}>
              {asset.title}
              {asset.variationOf ? <span className="ml-2 text-xs text-zinc-500">variation</span> : null}
            </div>
          ))}
        </div>
      </Card>
      <AssetEditor assets={assets} />
    </div>
  );
}
