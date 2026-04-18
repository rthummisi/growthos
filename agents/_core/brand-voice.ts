import type { BrandVoiceConfig } from "@shared/types/agent.types";

export function loadBrandVoice(
  config?: Partial<BrandVoiceConfig>
): BrandVoiceConfig {
  return {
    tone: config?.tone ?? "technical but approachable",
    style: config?.style ?? "clear, concise, developer-first",
    vocabulary: {
      include: config?.vocabulary?.include ?? ["developer", "workflow", "ship"],
      avoid: config?.vocabulary?.avoid ?? ["synergy", "revolutionary"]
    },
    preset: config?.preset
  };
}
