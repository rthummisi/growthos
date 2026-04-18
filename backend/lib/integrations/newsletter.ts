export async function post(content: string) {
  // Newsletter submission is manual — prepare the pitch copy
  return {
    id: "newsletter-manual",
    content,
    draftTarget: "console.dev",
    submitUrls: {
      "console.dev": "https://console.dev/tools/submit",
      "tldr": "https://tldr.tech/sponsor",
      "bytes": "https://bytes.dev/advertise"
    }
  };
}

export async function fetchMetrics(entityId: string): Promise<{ opens: number; clicks: number; entityId: string }> {
  // Newsletter metrics require individual publication API access
  return { opens: 0, clicks: 0, entityId };
}
