import Anthropic from "@anthropic-ai/sdk";
import { z, type ZodSchema } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export abstract class BaseAgent<TInput, TOutput> {
  abstract name: string;
  abstract run(input: TInput): Promise<TOutput>;

  protected async callClaude(systemPrompt: string, userPrompt: string, maxTokens = 4_000): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      return userPrompt;
    }

    const useCache = systemPrompt.length > 1000;

    let attempt = 0;
    let lastError: unknown;
    while (attempt < 3) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          system: useCache
            ? [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }]
            : systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        });
        const textBlock = response.content.find((block) => block.type === "text");
        return textBlock?.type === "text" ? textBlock.text : "";
      } catch (error) {
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
