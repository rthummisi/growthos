import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { trackEvent } from "@backend/lib/utm";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    utmContent: string;
    event: "click" | "signup" | "activation";
  };
  return json(await trackEvent(body.utmContent, body.event));
}
