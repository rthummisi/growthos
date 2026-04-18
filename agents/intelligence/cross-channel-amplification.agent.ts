import { BaseAgent } from "@agents/_core/base-agent";

export class CrossChannelAmplificationAgent extends BaseAgent<
  { sourceChannel: string; threshold: number },
  Array<{ channel: string; reason: string }>
> {
  name = "cross-channel-amplification";

  async run(input: { sourceChannel: string; threshold: number }) {
    return ["twitter", "linkedin", "reddit"].map((channel) => ({
      channel,
      reason: `Amplify the ${input.sourceChannel} spike to ${channel} because threshold ${input.threshold} has been exceeded.`
    }));
  }
}
