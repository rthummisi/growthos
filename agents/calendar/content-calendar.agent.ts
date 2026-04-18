import { BaseAgent } from "@agents/_core/base-agent";

const phaseMap = {
  awareness: ["community-post", "answer-reply", "awesome-list-entry"],
  consideration: ["blog-article", "demo-sandbox", "starter-template"],
  conversion: ["try-it-yourself", "github-repo", "newsletter-submission"]
};

export class ContentCalendarAgent extends BaseAgent<
  { productId: string; channelSlugs: string[]; weeks?: number },
  Array<{ productId: string; channelSlug: string; phase: string; scheduledAt: Date; status: string }>
> {
  name = "content-calendar";

  async run(input: { productId: string; channelSlugs: string[]; weeks?: number }) {
    const weeks = input.weeks ?? 8;
    const phases = Object.keys(phaseMap) as Array<keyof typeof phaseMap>;
    return input.channelSlugs.flatMap((channelSlug, index) =>
      phases.map((phase, phaseIndex) => ({
        productId: input.productId,
        channelSlug,
        phase,
        scheduledAt: new Date(Date.now() + (index + phaseIndex) * (weeks * 24 * 60 * 60 * 1000) / input.channelSlugs.length),
        status: "scheduled"
      }))
    );
  }
}
