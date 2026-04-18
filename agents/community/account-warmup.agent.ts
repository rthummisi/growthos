import { BaseAgent } from "@agents/_core/base-agent";

export class AccountWarmupAgent extends BaseAgent<
  { channel: string },
  Array<{ day: number; action: string }>
> {
  name = "account-warmup";

  async run(input: { channel: string }) {
    return [
      { day: 1, action: `Observe and comment helpfully in ${input.channel}.` },
      { day: 2, action: `Share a useful resource in ${input.channel}.` },
      { day: 3, action: `Introduce a concrete example before making any product mention in ${input.channel}.` }
    ];
  }
}
