#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./commands/run";
import { approveCommand } from "./commands/approve";
import { metricsCommand } from "./commands/metrics";
import { statusCommand } from "./commands/status";
import { scheduleCommand } from "./commands/schedule";
import { alertsCommand } from "./commands/alerts";
import { demoCommand } from "./commands/demo";
import { startCommand } from "./commands/start";

const program = new Command();

program.name("growthos").description("GrowthOS CLI").version("0.1.0");

program
  .command("run")
  .requiredOption("--product-id <productId>")
  .action(async (options: { productId: string }) => runCommand(options.productId));

program.command("approve").action(approveCommand);

program
  .command("metrics")
  .option("--channel <channel>")
  .action(async (options: { channel?: string }) => metricsCommand(options.channel));

program.command("status").action(statusCommand);

program
  .command("schedule")
  .requiredOption("--channel <channelSlug>")
  .requiredOption("--cadence <cadence>")
  .action(async (options: { channel: string; cadence: string }) =>
    scheduleCommand(options.channel, options.cadence)
  );

program.command("alerts").action(alertsCommand);

program
  .command("start")
  .description("Boot the full GrowthOS stack (Docker + DB + backend + frontend)")
  .action(startCommand);

program
  .command("demo")
  .requiredOption("--url <localUrl>", "Local URL of your running product (e.g. http://localhost:3000)")
  .requiredOption("--description <description>", "One-sentence product description")
  .option("--output-dir <outputDir>", "Directory to save MP4, GIF, and frames")
  .action(async (options: { url: string; description: string; outputDir?: string }) =>
    demoCommand(options.url, options.description, options.outputDir)
  );

// Default action: no subcommand → boot the stack
program.action(startCommand);

program.parseAsync(process.argv);
