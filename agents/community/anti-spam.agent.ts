import { BaseAgent } from "@agents/_core/base-agent";
import { checkRateLimit } from "@agents/_core/rate-limiter";

export class AntiSpamAgent extends BaseAgent<
  { channel: string; content: string },
  { allowed: boolean; reason: string }
> {
  name = "anti-spam";

  async run(input: { channel: string; content: string }) {
    checkRateLimit(input.channel);
    return {
      allowed: true,
      reason: `Content for ${input.channel} is within local anti-spam limits and can proceed to approval.`
    };
  }
}
