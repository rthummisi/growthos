export interface ScoringWeights {
  virality: number;
  audienceFit: number;
  effort: number;
  timeToValue: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  virality: 0.35,
  audienceFit: 0.3,
  effort: 0.2,
  timeToValue: 0.15
};
