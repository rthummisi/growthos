import { BaseChannelAgent, type ChannelAgentInput } from "@agents/channels/_factory";

export class DevtoAgent extends BaseChannelAgent {
  name = "devto-agent";
  protected channelSpecificMetadata(input: ChannelAgentInput) {
    return {
      tags: input.productProfile.technicalSurface.slice(0, 4).map((s) => s.toLowerCase()),
      publicationStrategy: "series with follow-up articles"
    };
  }
}
