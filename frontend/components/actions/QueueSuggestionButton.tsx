"use client";

import { useState } from "react";
import { apiPost } from "@frontend/lib/api";
import { Button } from "@frontend/components/ui/Button";

export function QueueSuggestionButton({
  productId,
  channelSlug,
  type,
  title,
  body,
  reasoning
}: {
  productId?: string;
  channelSlug: string;
  type: string;
  title: string;
  body: string;
  reasoning: string;
}) {
  const [queued, setQueued] = useState(false);

  const queue = async () => {
    await apiPost("/suggestions", {
      productId,
      channelSlug,
      type,
      title,
      body,
      reasoning
    });
    setQueued(true);
  };

  return (
    <Button disabled={queued} onClick={() => void queue()}>
      {queued ? "Queued" : "Add to Approval Queue"}
    </Button>
  );
}
