export interface SSEEvent {
  type: "agent:start" | "agent:done" | "agent:error" | "queue:update" | "alert:spike";
  agentName?: string;
  payload: unknown;
  timestamp: string;
}

type Listener = (event: SSEEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToEvents(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishEvent(event: Omit<SSEEvent, "timestamp">) {
  const payload: SSEEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };
  for (const listener of listeners) {
    listener(payload);
  }
}
