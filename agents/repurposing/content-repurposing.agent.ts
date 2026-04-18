import { CHANNELS } from "@shared/constants/channels";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ProductProfile } from "@shared/types/agent.types";

export class ContentRepurposingAgent extends BaseAgent<
  { coreIdea: string; productProfile: ProductProfile },
  { channel: string; content: string }[]
> {
  name = "content-repurposing";

  async run(input: { coreIdea: string; productProfile: ProductProfile }) {
    return CHANNELS.map((channel) => ({
      channel,
      content: `${input.coreIdea} Adapted for ${channel} with a voice that fits ${input.productProfile.icp.toLowerCase()}.`
    }));
  }
}
