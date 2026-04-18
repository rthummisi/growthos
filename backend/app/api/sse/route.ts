import { publishEvent, subscribeToEvents, type SSEEvent } from "@backend/lib/events";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const encoder = new TextEncoder();

function event(payload: SSEEvent) {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function GET() {
  let closed = false;
  let interval: ReturnType<typeof globalThis.setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const safeEnqueue = (payload: SSEEvent) => {
        if (closed) return;
        try {
          controller.enqueue(event(payload));
        } catch {
          closed = true;
        }
      };

      safeEnqueue({
        type: "agent:start",
        agentName: "growthos",
        payload: { status: "connected" },
        timestamp: new Date().toISOString()
      });

      unsubscribe = subscribeToEvents(safeEnqueue);

      interval = globalThis.setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        publishEvent({ type: "queue:update", payload: { pending: 0 } });
      }, 15_000);
    },
    cancel() {
      closed = true;
      unsubscribe?.();
      clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
