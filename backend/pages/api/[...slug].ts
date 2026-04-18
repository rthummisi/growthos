import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_request: NextApiRequest, response: NextApiResponse) {
  response.status(404).json({
    error: "Use App Router route handlers under backend/app/api."
  });
}
