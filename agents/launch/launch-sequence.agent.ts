import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { PlacementSuggestionOutput } from "@shared/types/agent.types";

const HIGH_COMPETITION_CHANNELS = new Set(["producthunt", "hackernews", "twitter", "reddit"]);
const LAUNCH_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

const rowSchema = z.object({
  channel: z.string(),
  scheduledAt: z.string(),
  rationale: z.string().min(20)
});

const SYSTEM_PROMPT = `You are a launch strategy expert coordinating a multi-channel product launch.

Given a launch date/time and channel list, produce an optimal launch schedule where:
- producthunt, hackernews, twitter, and reddit all fire within a 2-hour window of launchAt
- Supporting channels (devto, linkedin, newsletter, etc.) are scheduled within ±24 hours
- No two high-traffic channels fire at exactly the same minute
- Each scheduling decision has a clear rationale

Return a JSON array — one entry per channel:
[{ "channel": "github", "scheduledAt": "ISO-8601 datetime", "rationale": "why this time for this channel" }]`;

export class LaunchSequenceAgent extends BaseAgent<
  { launchAt: Date; suggestions: PlacementSuggestionOutput[] },
  Array<{ channel: string; scheduledAt: Date; content: PlacementSuggestionOutput; rationale: string }>
> {
  name = "launch-sequence";

  async run(input: { launchAt: Date; suggestions: PlacementSuggestionOutput[] }) {
    const channelList = input.suggestions.map((s) => s.channelSlug).join(", ");

    const userPrompt = `Launch time: ${input.launchAt.toISOString()}
Channels to schedule: ${channelList}

High-competition window channels (must land within 2h of launch): producthunt, hackernews, twitter, reddit

Schedule all channels with rationale for each timing decision.`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt, 3_000);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);

    let schedule: { channel: string; scheduledAt: string; rationale: string }[] = [];
    if (jsonMatch) {
      const rows = JSON.parse(jsonMatch[0]) as unknown[];
      schedule = rows
        .map((r) => rowSchema.safeParse(r))
        .filter((r) => r.success)
        .map((r) => r.data!);
    }

    // Fallback: ensure high-competition channels land in 2h window
    const launchMs = input.launchAt.getTime();
    let hcOffset = 0;

    return input.suggestions.map((content) => {
      const scheduled = schedule.find((s) => s.channel === content.channelSlug);
      let scheduledAt: Date;
      let rationale: string;

      if (scheduled) {
        scheduledAt = new Date(scheduled.scheduledAt);
        rationale = scheduled.rationale;
      } else if (HIGH_COMPETITION_CHANNELS.has(content.channelSlug)) {
        scheduledAt = new Date(launchMs + hcOffset * (LAUNCH_WINDOW_MS / 4));
        hcOffset++;
        rationale = `Scheduled within the 2-hour launch window to maximize cross-channel momentum.`;
      } else {
        const hoursOffset = 4 + (input.suggestions.indexOf(content) * 2);
        scheduledAt = new Date(launchMs + hoursOffset * 60 * 60 * 1000);
        rationale = `Scheduled after launch window to capture secondary attention from initial spike.`;
      }

      return { channel: content.channelSlug, scheduledAt, content, rationale };
    });
  }
}
