import { execFileSync } from "child_process";
import path from "path";

export function startCommand() {
  // __dirname at runtime = cli/dist/cli/commands/ due to rootDir being repo root
  const script = path.resolve(__dirname, "../../../../growthos.sh");
  execFileSync("bash", [script], { stdio: "inherit" });
}
