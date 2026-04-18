import { BaseChannelAgent } from "@agents/channels/_factory";

export class IntegrationMarketplaceAgent extends BaseChannelAgent {
  name = "integration-marketplace-agent";
  protected channelSpecificMetadata() {
    return { marketplaces: ["VS Code", "JetBrains"], assetRequirements: ["icon 128x128", "screenshot", "changelog"] };
  }
}
