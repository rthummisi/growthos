#!/usr/bin/env npx ts-node
import { DemoGenerationAgent } from "../agents/demo/demo-generation.agent";

const [, , localUrl, description, outputDir] = process.argv;

if (!localUrl || !description) {
  console.error("Usage: run-demo.ts <url> <description> [outputDir]");
  process.exit(1);
}

(async () => {
  const agent = new DemoGenerationAgent();
  await agent.run({ productDescription: description, localUrl, outputDir });
})();
