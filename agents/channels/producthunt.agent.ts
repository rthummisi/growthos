import { BaseChannelAgent } from "@agents/channels/_factory";

export class ProductHuntAgent extends BaseChannelAgent {
  name = "producthunt-agent";
  protected channelSpecificMetadata() {
    return { launchTime: "09:00 PT", gallery: ["hero.png", "workflow.png", "demo.gif"] };
  }
}
