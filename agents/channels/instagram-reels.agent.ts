import { BaseChannelAgent } from "@agents/channels/_factory";

export class InstagramReelsAgent extends BaseChannelAgent {
  name = "instagram-reels-agent";

  protected channelSpecificMetadata() {
    return {
      aspectRatio: "9:16",
      durationSeconds: "20-35",
      emphasis: ["scroll-stopping hook", "overlay text", "caption clarity", "save/share intent"]
    };
  }
}
