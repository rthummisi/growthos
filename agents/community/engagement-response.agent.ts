import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";

const rowSchema = z.object({
  comment: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  draftReply: z.string().min(50)
});

const SYSTEM_PROMPT = `You are a developer relations specialist drafting replies to post comments.

For each comment provided, generate a specific, genuine reply that:
- Acknowledges the specific point the commenter made
- Adds value (answers their question, addresses their concern, or builds on their idea)
- Represents the product team authentically — honest, not defensive
- Keeps momentum going in high-traction threads

priority:
- "high": question that many readers likely share, criticism that needs addressing, or positive comment with high engagement potential
- "medium": genuine engagement that deserves a reply
- "low": acknowledgement-only or off-topic

Return a JSON array:
[{ "comment": "the comment text", "priority": "high", "draftReply": "full reply text" }]`;

export class EngagementResponseAgent extends BaseAgent<
  { comments: string[]; productContext: string; channelContext: string },
  Array<{ comment: string; priority: "high" | "medium" | "low"; draftReply: string }>
> {
  name = "engagement-response";

  async run(input: { comments: string[]; productContext: string; channelContext: string }) {
    const userPrompt = `Channel: ${input.channelContext}
Product context: ${input.productContext}

Comments to respond to:
${input.comments.map((c, i) => `${i + 1}. "${c}"`).join("\n")}

Draft a reply for each comment.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 4_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("EngagementResponseAgent: no JSON array in Claude response");

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data! as { comment: string; priority: "high" | "medium" | "low"; draftReply: string });
  }
}
