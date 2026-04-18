import { BaseChannelAgent } from "@agents/channels/_factory";

export class HackerNewsAgent extends BaseChannelAgent {
  name = "hackernews-agent";
  protected channelSpecificMetadata() {
    return { titlePrefix: "Show HN:", submissionMode: "manual" };
  }
}
