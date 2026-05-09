import type { AssetOutput } from "@shared/types/agent.types";

export interface AssetListResponse {
  assets: AssetOutput[];
}

export interface PersistedAsset {
  id: string;
  title: string;
  type: string;
  content: string;
  variationOf?: string | null;
}
