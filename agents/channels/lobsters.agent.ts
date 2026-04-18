import { BaseChannelAgent } from "@agents/channels/_factory";

export class LobstersAgent extends BaseChannelAgent {
  name = "lobsters-agent";
  protected channelSpecificMetadata() {
    return { tags: ["programming", "tools", "devops"], style: "technical-depth-first" };
  }
}
