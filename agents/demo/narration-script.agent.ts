import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const StepSchema = z.object({
  action: z.enum(["goto", "click", "type", "scroll", "wait", "hover"]),
  selector: z.string().optional(),
  value: z.string().optional(),
  url: z.string().optional(),
  narration: z.string(),
  durationMs: z.number()
});

const ScriptSchema = z.object({
  title: z.string(),
  totalDurationMs: z.number(),
  steps: z.array(StepSchema)
});

export type DemoStep = z.infer<typeof StepSchema>;
export type DemoScript = z.infer<typeof ScriptSchema>;

const SYSTEM = `You are a product demo scriptwriter. Given a product description and its local URL, output a JSON demo script that:
- Runs 60-90 seconds total
- Shows the core value prop in the first 15 seconds
- Has 6-10 steps — no more
- Each narration line is one clear sentence, max 12 words, spoken naturally
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

export async function generateNarrationScript(
  productDescription: string,
  localUrl: string
): Promise<DemoScript> {
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
  if (!match) throw new Error("No JSON in narration script response");

  return ScriptSchema.parse(JSON.parse(match[0]));
}
