"use client";

import { useEffect } from "react";

/**
 * Sends humans on to the quiz shortly after the share landing page paints.
 * Link crawlers never run JS, so they keep the OG metadata on `/s/[score]`.
 * A client-side `location.replace` (not a server `redirect()`) is deliberate.
 */
export function Redirector({
  to = "/",
  delayMs = 1200,
}: {
  to?: string;
  delayMs?: number;
}) {
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.location.replace(to);
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [to, delayMs]);

  return null;
}
