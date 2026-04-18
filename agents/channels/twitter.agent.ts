import { BaseChannelAgent } from "@agents/channels/_factory";

export class TwitterAgent extends BaseChannelAgent {
  name = "twitter-agent";
  protected channelSpecificMetadata() {
    return { format: "numbered-thread", maxTweetLength: 280, minTweets: 5, maxTweets: 8 };
  }
}
