import { BaseChannelAgent } from "@agents/channels/_factory";

export class LinkedInAgent extends BaseChannelAgent {
  name = "linkedin-agent";
  protected channelSpecificMetadata() {
    return { angle: "technical founder narrative", formatOptions: ["text-post", "carousel"] };
  }
}
