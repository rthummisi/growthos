import { BaseChannelAgent } from "@agents/channels/_factory";

export class SlackAgent extends BaseChannelAgent {
  name = "slack-agent";
  protected channelSpecificMetadata() {
    return { workspaces: ["engineering-leaders", "devtools-builders"], dmVsPublic: "public first" };
  }
}
