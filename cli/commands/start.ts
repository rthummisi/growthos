import { execFileSync } from "child_process";
import path from "path";

export function startCommand() {
  // __dirname at runtime = cli/dist/commands/
  // ../../../growthos.sh = GrowthOS/growthos.sh
  const script = path.resolve(__dirname, "../../../growthos.sh");
  execFileSync("bash", [script], { stdio: "inherit" });
}
