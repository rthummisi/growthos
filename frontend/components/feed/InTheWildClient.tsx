"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@frontend/components/ui/Card";
import { Badge } from "@frontend/components/ui/Badge";
import { apiGet, apiPost } from "@frontend/lib/api";

interface WildMatch {
  id: string;
  source: string;
  url: string;
  title: string;
  matchReason: string;
  draftReply: string;
  fetchedAt: string;
}

interface MarketSignal {
  id: string;
  insight: string;
  priority: "high" | "medium" | "low";
  suggestion: string;
  generatedAt: string;
}

interface FeedData {
  matches: WildMatch[];
  signals: MarketSignal[];
  lastScan: string | null;
  activeSources: string[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/20 text-red-300",
  medium: "bg-amber-500/20 text-amber-300",
  low: "bg-zinc-700 text-zinc-400"
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ReplyBox({ reply }: { reply: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-violet-400 hover:text-violet-300"
      >
        {open ? "▲ Hide draft reply" : "▼ Show draft reply"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-zinc-800/60 p-3">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">{reply}</p>
          <button
            onClick={copy}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {copied ? "✓ Copied" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}

export function InTheWildClient() {
  const [data, setData] = useState<FeedData | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await apiGet<FeedData>("/in-the-wild?productId=demo-product-1");
      setData(result);
    } catch {
      setData({ matches: [], signals: [], lastScan: null, activeSources: [] });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const scan = async () => {
    setScanning(true);
    setError(null);
    try {
      const result = await apiPost<FeedData>("/in-the-wild/scan?productId=demo-product-1", {});
      setData(result);
    } catch {
      setError("Scan failed — check that ANTHROPIC_API_KEY is set and the backend is running.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">In The Wild</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {data?.lastScan
                ? `Last scanned ${timeAgo(data.lastScan)} · ${data.matches.length} live opportunities`
                : "Find live conversations where your product is the answer"}
            </p>
          </div>
          <button
            onClick={scan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <span className="animate-spin">⟳</span>
                Scanning…
              </>
            ) : (
              <>⚡ Scan Now</>
            )}
          </button>
        </div>
        {data && data.activeSources.length > 0 && !scanning && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.activeSources.map((s) => (
              <span key={s} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {s}
              </span>
            ))}
          </div>
        )}
        {scanning && (
          <div className="mt-3 rounded-lg bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
            Searching GitHub, Hacker News, Stack Overflow, Reddit, DEV.to, Lobsters
            {process.env.NEXT_PUBLIC_BRAVE_ENABLED === "1" ? ", and the web" : ""} for conversations where your product is the answer, then running market signal analysis…
            <span className="ml-2 text-zinc-500">~20–30s</span>
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </Card>

      {/* Market Signals */}
      {data && data.signals.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Market Signals
          </h2>
          <div className="space-y-3">
            {data.signals.map((s) => (
              <Card key={s.id} className="border-l-2 border-l-violet-500">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{s.insight}</p>
                    <p className="mt-1.5 text-sm text-zinc-400">{s.suggestion}</p>
                  </div>
                  <Badge className={PRIORITY_STYLES[s.priority] ?? PRIORITY_STYLES.low}>
                    {s.priority}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wild Matches */}
      {data && data.matches.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Live Opportunities · {data.matches.length}
          </h2>
          <div className="space-y-4">
            {data.matches.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-zinc-500">
                        {item.source}
                      </span>
                      <span className="text-xs text-zinc-600">{timeAgo(item.fetchedAt)}</span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-violet-300 hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="mt-2 text-sm text-zinc-400">{item.matchReason}</p>
                    <ReplyBox reply={item.draftReply} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data && data.matches.length === 0 && !scanning && (
        <Card className="py-12 text-center">
          <div className="text-4xl mb-3">🌐</div>
          <p className="text-sm font-medium text-zinc-300">No results yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Click <strong>Scan Now</strong> to search for live conversations where your product is the answer
          </p>
        </Card>
      )}
    </div>
  );
}
