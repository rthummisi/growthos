import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";

test("cli package builds a help command", async () => {
  const output = execSync("node cli/dist/index.js --help", { cwd: process.cwd(), encoding: "utf8" });
  expect(output).toContain("GrowthOS CLI");
  expect(output).toContain("schedule");
  expect(output).toContain("alerts");
});
