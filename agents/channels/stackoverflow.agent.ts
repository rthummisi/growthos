import { BaseChannelAgent } from "@agents/channels/_factory";

export class StackOverflowAgent extends BaseChannelAgent {
  name = "stackoverflow-agent";
  protected channelSpecificMetadata() {
    return { strategy: "answer-first, product-natural", minimumQuestionScore: 5 };
  }
}
