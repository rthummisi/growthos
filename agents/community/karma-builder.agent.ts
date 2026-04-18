import { BaseAgent } from "@agents/_core/base-agent";

export class KarmaBuilderAgent extends BaseAgent<
  { communities: string[] },
  Array<{ community: string; contributionType: string; draft: string }>
> {
  name = "karma-builder";

  async run(input: { communities: string[] }) {
    return input.communities.map((community) => ({
      community,
      contributionType: "helpful answer",
      draft: `Share a concise answer in ${community} that solves the immediate problem without pushing the product first.`
    }));
  }
}
