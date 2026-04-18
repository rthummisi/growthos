import { BrandVoiceConfig } from "@frontend/components/forms/BrandVoiceConfig";
import { ProductIntakeWizard } from "@frontend/components/forms/ProductIntakeWizard";

export default function IntakePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <ProductIntakeWizard />
      <BrandVoiceConfig />
    </div>
  );
}
