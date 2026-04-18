import { BaseChannelAgent, type ChannelAgentInput } from "@agents/channels/_factory";

export class NpmRegistryAgent extends BaseChannelAgent {
  name = "npm-registry-agent";
  protected channelSpecificMetadata(input: ChannelAgentInput) {
    return {
      keywords: input.productProfile.technicalSurface.map((s) => s.toLowerCase()),
      registries: ["npm", "PyPI", "crates.io"]
    };
  }
}
