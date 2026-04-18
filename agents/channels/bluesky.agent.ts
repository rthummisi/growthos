import { BaseChannelAgent } from "@agents/channels/_factory";

export class BlueskyAgent extends BaseChannelAgent {
  name = "bluesky-agent";
  protected channelSpecificMetadata() {
    return { starterPackOpportunity: true, format: "short thread, code-forward" };
  }
}
