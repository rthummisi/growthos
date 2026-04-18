import { BaseAgent } from "@agents/_core/base-agent";

export class EngagementResponseAgent extends BaseAgent<
  { comments: string[] },
  Array<{ comment: string; priority: "high" | "medium" | "low"; draftReply: string }>
> {
  name = "engagement-response";

  async run(input: { comments: string[] }) {
    return input.comments.map((comment, index) => ({
      comment,
      priority: index === 0 ? "high" : "medium",
      draftReply: `Thanks for the feedback. The shortest path to validate this is to try the focused workflow and compare the time-to-value against your current process.`
    }));
  }
}
