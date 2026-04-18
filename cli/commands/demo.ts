import { execFileSync } from "child_process";
import path from "path";

export function demoCommand(localUrl: string, description: string, outputDir?: string) {
  const script = path.resolve(__dirname, "../../../scripts/run-demo.ts");
  const args = [script, localUrl, description];
  if (outputDir) args.push(outputDir);
  execFileSync("npx", ["ts-node", ...args], { stdio: "inherit" });
}
