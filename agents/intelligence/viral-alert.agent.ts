import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const outputSchema = z.object({
  suggestionId: z.string(),
  channel: z.string(),
  metric: z.string(),
  currentValue: z.number(),
  baseline: z.number(),
  rapidResponseOptions: z.array(z.string().min(30)).min(3)
});

const SYSTEM_PROMPT = `You are a growth analyst generating rapid-response content strategies for viral moments.

Given a post that is spiking on a specific channel, generate 3 concrete rapid-response options the product team can execute immediately.

Each option must be:
- A fully described action, not a vague suggestion
- Executable within the next 2 hours
- Specific to the channel and the content that is spiking

Return JSON:
{
  "suggestionId": "same as input",
  "channel": "same as input",
  "metric": "the metric that spiked",
  "currentValue": same as input,
  "baseline": same as input,
  "rapidResponseOptions": ["complete description of option 1", "complete description of option 2", "complete description of option 3"]
}`;

export class ViralAlertAgent extends BaseAgent<
  { suggestionId: string; channel: string; metric: string; currentValue: number; baseline: number; contentSummary: string },
  { suggestionId: string; channel: string; metric: string; currentValue: number; baseline: number; rapidResponseOptions: string[] }
> {
  name = "viral-alert";

  async run(input: {
    suggestionId: string;
    channel: string;
    metric: string;
    currentValue: number;
    baseline: number;
    contentSummary: string;
  }) {
    const userPrompt = `Viral moment detected:
Channel: ${input.channel}
Metric: ${input.metric}
Current value: ${input.currentValue} (was ${input.baseline} — ${Math.round((input.currentValue / Math.max(input.baseline, 1)) * 100)}% increase)
Content that is spiking: ${input.contentSummary}

Generate 3 rapid-response options to capitalize on this moment.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 2_000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        ...input,
        rapidResponseOptions: [
          `Post a follow-up on ${input.channel} that answers the most common question in the comments, linking back to the original.`,
          `Repurpose the top-performing angle to an adjacent channel within the next hour while momentum is live.`,
          `Add a concrete code example or demo link to the original post to convert attention into product trial.`
        ]
      };
    }

    return outputSchema.parse(JSON.parse(jsonMatch[0]));
  }
}
