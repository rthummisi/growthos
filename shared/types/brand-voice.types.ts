export interface BrandVoicePreviewRequest {
  tone: number;
  style: number;
  include: string[];
  avoid: string[];
  preset?: string;
}
