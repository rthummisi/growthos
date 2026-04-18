#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./commands/run";
import { approveCommand } from "./commands/approve";
import { metricsCommand } from "./commands/metrics";
import { statusCommand } from "./commands/status";
import { scheduleCommand } from "./commands/schedule";
import { alertsCommand } from "./commands/alerts";

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

program.parseAsync(process.argv);
