export function subscribeToGrowthOSEvents(onMessage: (event: MessageEvent<string>) => void) {
  const source = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api"}/sse`);
  source.onmessage = onMessage;
  return () => source.close();
}
