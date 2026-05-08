import Anthropic from "@anthropic-ai/sdk";
import { z, type ZodSchema } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

let anthropicUnavailable = false;

export abstract class BaseAgent<TInput, TOutput> {
  abstract name: string;
  abstract run(input: TInput): Promise<TOutput>;

  protected async callClaude(systemPrompt: string, userPrompt: string, maxTokens = 4_000): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY || anthropicUnavailable) {
      return userPrompt;
    }

    // Always mark system prompt cacheable; Anthropic skips the cache if below
    // the minimum token threshold so there's no cost to always opting in.
    const userContent: Anthropic.MessageParam["content"] =
      userPrompt.length > 2_000
        ? [{ type: "text", text: userPrompt, cache_control: { type: "ephemeral" } }]
        : userPrompt;

    let attempt = 0;
    let lastError: unknown;
    while (attempt < 3) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userContent }]
        });
        const textBlock = response.content.find((block) => block.type === "text");
        return textBlock?.type === "text" ? textBlock.text : "";
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = typeof error === "object" && error !== null && "status" in error ? (error as { status?: number }).status : undefined;
        if (
          status === 400 ||
          message.toLowerCase().includes("credit balance is too low") ||
          message.toLowerCase().includes("invalid_request_error")
        ) {
          anthropicUnavailable = true;
          return userPrompt;
        }
        lastError = error;
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Claude call failed");
  }

  protected enforceOutputContract(output: unknown, schema: ZodSchema<TOutput>): TOutput {
    return schema.parse(output);
  }

  protected jsonFromText<TSchema extends z.ZodTypeAny>(text: string, schema: TSchema): z.infer<TSchema> {
    return schema.parse(JSON.parse(text));
  }
}
