import { BaseAgent } from "@agents/_core/base-agent";
import type { PlacementSuggestionOutput } from "@shared/types/agent.types";

export class ContentPerformancePredictorAgent extends BaseAgent<
  PlacementSuggestionOutput[],
  Array<PlacementSuggestionOutput & { predictedEngagement: number }>
> {
  name = "content-performance-predictor";

  async run(input: PlacementSuggestionOutput[]) {
    return input.map((suggestion) => ({
      ...suggestion,
      predictedEngagement: Math.round(
        suggestion.viralityScore * 0.5 + suggestion.audienceFit * 0.35 + (100 - suggestion.effortScore) * 0.15
      )
    }));
  }
}
