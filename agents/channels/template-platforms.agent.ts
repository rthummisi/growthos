import { BaseChannelAgent } from "@agents/channels/_factory";

export class TemplatePlatformsAgent extends BaseChannelAgent {
  name = "template-platforms-agent";
  protected channelSpecificMetadata() {
    return { platforms: ["StackBlitz", "CodeSandbox", "Replit"], goal: "5-min working demo" };
  }
}
