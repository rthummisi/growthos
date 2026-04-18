import { BaseAgent } from "@agents/_core/base-agent";
import type { PlacementSuggestionOutput } from "@shared/types/agent.types";

export class LaunchSequenceAgent extends BaseAgent<
  { launchAt: Date; suggestions: PlacementSuggestionOutput[] },
  Array<{ channel: string; scheduledAt: Date; content: PlacementSuggestionOutput }>
> {
  name = "launch-sequence";

  async run(input: { launchAt: Date; suggestions: PlacementSuggestionOutput[] }) {
    return input.suggestions.map((content, index) => ({
      channel: content.channelSlug,
      scheduledAt: new Date(input.launchAt.getTime() + (index - 2) * 30 * 60 * 1000),
      content
    }));
  }
}
