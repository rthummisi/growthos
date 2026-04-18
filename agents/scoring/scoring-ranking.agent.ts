import { BaseAgent } from "@agents/_core/base-agent";
import { DEFAULT_SCORING_WEIGHTS } from "@shared/constants/scoring";
import type { PlacementSuggestionOutput } from "@shared/types/agent.types";

export class ScoringRankingAgent extends BaseAgent<
  PlacementSuggestionOutput[],
  PlacementSuggestionOutput[]
> {
  name = "scoring-ranking";

  async run(input: PlacementSuggestionOutput[]) {
    return [...input]
      .map((suggestion) => ({
        ...suggestion,
        rank:
          suggestion.viralityScore * DEFAULT_SCORING_WEIGHTS.virality +
          suggestion.audienceFit * DEFAULT_SCORING_WEIGHTS.audienceFit +
          (100 - suggestion.effortScore) * DEFAULT_SCORING_WEIGHTS.effort +
          (100 - suggestion.timeToValue) * DEFAULT_SCORING_WEIGHTS.timeToValue
      }))
      .sort((left, right) => (right.rank ?? 0) - (left.rank ?? 0));
  }
}
