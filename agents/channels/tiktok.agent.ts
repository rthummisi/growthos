import { BaseChannelAgent } from "@agents/channels/_factory";

export class TiktokAgent extends BaseChannelAgent {
  name = "tiktok-agent";

  protected channelSpecificMetadata() {
    return {
      aspectRatio: "9:16",
      durationSeconds: "15-30",
      emphasis: ["first-frame hook", "watch-through rate", "native caption pacing", "shareable proof"]
    };
  }
}
