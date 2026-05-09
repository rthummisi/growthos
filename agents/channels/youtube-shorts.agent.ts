import { BaseChannelAgent } from "@agents/channels/_factory";

export class YouTubeShortsAgent extends BaseChannelAgent {
  name = "youtube-shorts-agent";

  protected channelSpecificMetadata() {
    return {
      aspectRatio: "9:16",
      durationSeconds: "25-40",
      emphasis: ["tutorial clarity", "retention curve", "title packaging", "demo payoff"]
    };
  }
}
