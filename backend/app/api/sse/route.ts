import { publishEvent, subscribeToEvents, type SSEEvent } from "@backend/lib/events";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const encoder = new TextEncoder();

function event(payload: SSEEvent) {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        event({
          type: "agent:start",
          agentName: "growthos",
          payload: { status: "connected" },
          timestamp: new Date().toISOString()
        })
      );
      const unsubscribe = subscribeToEvents((payload) => {
        controller.enqueue(event(payload));
      });
      const interval = globalThis.setInterval(() => {
        publishEvent({ type: "queue:update", payload: { pending: 0 } });
      }, 15_000);
      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    },
    cancel() {}
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
