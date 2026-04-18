import { spawnSync } from "child_process";
import path from "path";

export function startCommand() {
  const script = path.resolve(__dirname, "../../../growthos.sh");
  const result = spawnSync("bash", [script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
