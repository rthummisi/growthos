import { BaseChannelAgent } from "@agents/channels/_factory";

export class IndieHackersAgent extends BaseChannelAgent {
  name = "indiehackers-agent";
  protected channelSpecificMetadata() {
    return { postTypes: ["milestone", "product-page", "community-thread"], tone: "honest and specific" };
  }
}
