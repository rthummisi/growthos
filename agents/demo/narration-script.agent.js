"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNarrationScript = generateNarrationScript;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const zod_1 = require("zod");
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const StepSchema = zod_1.z.object({
    action: zod_1.z.enum(["goto", "click", "type", "scroll", "wait", "hover"]),
    selector: zod_1.z.string().optional(),
    value: zod_1.z.string().optional(),
    url: zod_1.z.string().optional(),
    narration: zod_1.z.string(),
    durationMs: zod_1.z.number()
});
const ScriptSchema = zod_1.z.object({
    title: zod_1.z.string(),
    totalDurationMs: zod_1.z.number(),
    steps: zod_1.z.array(StepSchema)
});
const SYSTEM = `You are a product demo scriptwriter. Given a product description and its local URL, output a JSON demo script that:
- Runs 60-90 seconds total
- Shows the core value prop in the first 15 seconds
- Has 6-10 steps — no more
- Each narration line is one clear sentence, max 12 words, spoken naturally
- Alternates perspective: even steps narrated by Aria (female presenter), odd steps by Andrew (male presenter)
- Focuses on outcomes, not UI mechanics ("Watch it find the best channels" not "Click the button")
- Ends with a call to action

Output ONLY valid JSON matching this schema:
{
  "title": "string",
  "totalDurationMs": number,
  "steps": [
    {
      "action": "goto" | "click" | "type" | "scroll" | "wait" | "hover",
      "selector": "CSS selector (omit for goto/wait)",
      "value": "text to type or scroll amount (omit if not applicable)",
      "url": "full URL (only for goto action)",
      "narration": "one sentence spoken during this step",
      "durationMs": number
    }
  ]
}`;
async function generateNarrationScript(productDescription, localUrl) {
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: SYSTEM,
        messages: [
            {
                role: "user",
                content: `Product: ${productDescription}\nLocal URL: ${localUrl}\n\nGenerate the demo script JSON.`
            }
        ]
    });
    const raw = response.content.find((b) => b.type === "text")?.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error("No JSON in narration script response");
    return ScriptSchema.parse(JSON.parse(match[0]));
}
