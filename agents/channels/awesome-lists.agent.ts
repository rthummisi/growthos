import { BaseChannelAgent } from "@agents/channels/_factory";

export class AwesomeListsAgent extends BaseChannelAgent {
  name = "awesome-lists-agent";
  protected channelSpecificMetadata() {
    return { prApproach: "one list at a time, genuine fit only", entryFormat: "- [Name](url) - one-line description" };
  }
}
