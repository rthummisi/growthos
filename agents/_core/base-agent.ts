import Anthropic from "@anthropic-ai/sdk";
import { z, type ZodSchema } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

let anthropicUnavailable = false;

export abstract class BaseAgent<TInput, TOutput> {
  abstract name: string;
  abstract run(input: TInput): Promise<TOutput>;

  /**
   * Calls a local Ollama instance (default: gemma3:4b) using the OpenAI-compatible
   * /v1/chat/completions endpoint.
   *
   * Returns an empty string when:
   * - OLLAMA_BASE_URL is not set and we are not in development mode
   * - The request fails for any reason
   *
   * This makes it safe to use as a no-cost fallback — callers can check for
   * an empty string and fall back to Claude or a static default.
   */
  protected async callOllama(systemPrompt: string, userPrompt: string, maxTokens = 4_000): Promise<string> {
    const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
    const model = process.env.OLLAMA_MODEL ?? "gemma3:4b";

    // Only run in development unless OLLAMA_BASE_URL is explicitly configured.
    if (!process.env.OLLAMA_BASE_URL && process.env.NODE_ENV !== "development") return "";

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer ollama" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(120_000)
      });
      if (!res.ok) return "";
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? "";
    } catch {
      return "";
    }
  }

  protected async callClaude(systemPrompt: string, userPrompt: string, maxTokens = 4_000): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY || anthropicUnavailable) {
      // No Anthropic key or known unavailable — try Ollama before giving up.
      const ollamaResult = await this.callOllama(systemPrompt, userPrompt, maxTokens);
      return ollamaResult || userPrompt;
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
        const claudeResult = textBlock?.type === "text" ? textBlock.text : "";

        // If Claude returned empty content (unexpected), try Ollama as a fallback.
        if (!claudeResult) {
          const ollamaResult = await this.callOllama(systemPrompt, userPrompt, maxTokens);
          return ollamaResult || "";
        }

        return claudeResult;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = typeof error === "object" && error !== null && "status" in error ? (error as { status?: number }).status : undefined;
        if (
          status === 400 ||
          message.toLowerCase().includes("credit balance is too low") ||
          message.toLowerCase().includes("invalid_request_error")
        ) {
          anthropicUnavailable = true;
          // Credit exhausted — fall back to Ollama immediately.
          const ollamaResult = await this.callOllama(systemPrompt, userPrompt, maxTokens);
          return ollamaResult || userPrompt;
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
