import { BaseChannelAgent, type ChannelAgentInput } from "@agents/channels/_factory";

export class GitHubAgent extends BaseChannelAgent {
  name = "github-agent";
  protected channelSpecificMetadata(input: ChannelAgentInput) {
    return {
      topics: input.productProfile.technicalSurface.slice(0, 6).map((s) => s.toLowerCase().replace(/\s+/g, "-")),
      tryItFlow: "Clone → configure .env → run npm start → see result in under 5 minutes"
    };
  }
}
