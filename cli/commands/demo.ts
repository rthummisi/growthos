import { DemoGenerationAgent } from "../../agents/demo/demo-generation.agent";

export async function demoCommand(localUrl: string, description: string, outputDir?: string) {
  console.log(`GrowthOS Demo Generator`);
  console.log(`URL: ${localUrl}`);
  console.log(`Cost: ~$0.001 (Haiku script + local TTS + ffmpeg)\n`);

  const agent = new DemoGenerationAgent();
  const result = await agent.run({ productDescription: description, localUrl, outputDir });

  console.log(`\nScript: "${result.script.title}"`);
  console.log(`Steps: ${result.script.steps.length} | Duration: ${(result.script.totalDurationMs / 1000).toFixed(0)}s`);
  console.log(`\nDeliverables:`);
  console.log(`  MP4 (Product Hunt / LinkedIn / Marketplaces) → ${result.mp4}`);
  console.log(`  GIF (GitHub README / Reddit / Dev.to)        → ${result.gif}`);
  console.log(`  Work dir                                      → ${result.workDir}`);
}
