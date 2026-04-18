import { BaseChannelAgent } from "@agents/channels/_factory";

export class HashnodeAgent extends BaseChannelAgent {
  name = "hashnode-agent";
  protected channelSpecificMetadata() {
    return { series: "Developer growth systems", crossPostPolicy: "canonical to own domain" };
  }
}
