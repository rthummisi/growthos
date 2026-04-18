import { BaseChannelAgent } from "@agents/channels/_factory";

export class NewsletterAgent extends BaseChannelAgent {
  name = "newsletter-agent";
  protected channelSpecificMetadata() {
    return {
      publications: ["TLDR", "Bytes", "console.dev", "Changelog"],
      pitchFormat: "problem, proof, reader payoff",
      timing: "Tuesday morning PT"
    };
  }
}
