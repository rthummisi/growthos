import type { PlacementSuggestionOutput } from "@shared/types/agent.types";

export interface SuggestionListResponse {
  suggestions: PlacementSuggestionOutput[];
  total: number;
}
