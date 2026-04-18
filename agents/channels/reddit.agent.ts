import { BaseChannelAgent, type ChannelAgentInput } from "@agents/channels/_factory";

export class RedditAgent extends BaseChannelAgent {
  name = "reddit-agent";
  protected channelSpecificMetadata(input: ChannelAgentInput) {
    const communities = input.productProfile.targetCommunities.filter((c) => c.startsWith("r/"));
    return {
      subreddits: communities.length ? communities : ["r/programming", "r/devops", "r/webdev"],
      communityRulesCheck: true
    };
  }
}
