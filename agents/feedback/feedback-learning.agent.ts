import { BaseAgent } from "@agents/_core/base-agent";
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeights } from "@shared/constants/scoring";

export class FeedbackLearningAgent extends BaseAgent<
  { engagementAverage: number; conversionAverage: number; velocityAverage: number },
  ScoringWeights
> {
  name = "feedback-learning";

  async run(input: { engagementAverage: number; conversionAverage: number; velocityAverage: number }) {
    const total = Math.max(1, input.engagementAverage + input.conversionAverage + input.velocityAverage);
    return {
      virality: Math.max(DEFAULT_SCORING_WEIGHTS.virality, input.engagementAverage / total),
      audienceFit: Math.max(DEFAULT_SCORING_WEIGHTS.audienceFit, input.conversionAverage / total),
      effort: DEFAULT_SCORING_WEIGHTS.effort,
      timeToValue: Math.max(0.05, input.velocityAverage / total)
    };
  }
}
