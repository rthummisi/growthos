"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY
});
class BaseAgent {
    async callClaude(systemPrompt, userPrompt, maxTokens = 4_000) {
        if (!process.env.ANTHROPIC_API_KEY) {
            return userPrompt;
        }
        const useCache = systemPrompt.length > 1000;
        let attempt = 0;
        let lastError;
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
            }
            catch (error) {
                lastError = error;
                attempt += 1;
                await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
            }
        }
        throw lastError instanceof Error ? lastError : new Error("Claude call failed");
    }
    enforceOutputContract(output, schema) {
        return schema.parse(output);
    }
    jsonFromText(text, schema) {
        return schema.parse(JSON.parse(text));
    }
}
exports.BaseAgent = BaseAgent;
