import { BaseChannelAgent, type ChannelAgentInput } from "@agents/channels/_factory";

export class DiscordAgent extends BaseChannelAgent {
  name = "discord-agent";
  protected channelSpecificMetadata(input: ChannelAgentInput) {
    return {
      targetServers: input.productProfile.targetCommunities.slice(0, 3),
      channelFit: "showcase, tooling, or general channels"
    };
  }
}
