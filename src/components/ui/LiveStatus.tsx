"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface LiveApi {
  /** Announce politely. Throttled to one message per 2 s, except `force`. */
  announce: (text: string, opts?: { force?: boolean }) => void;
}

const LiveContext = createContext<LiveApi | null>(null);

/** One shared visually-hidden aria-live="polite" region for the whole app. */
export function LiveStatusProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState("");
  const last = useRef(0);

  const announce = useCallback((t: string, opts?: { force?: boolean }) => {
    const now = Date.now();
    if (!opts?.force && now - last.current < 2000) return;
    last.current = now;
    // Clear then set so identical messages are re-announced.
    setText("");
    requestAnimationFrame(() => setText(t));
  }, []);

  const api = useMemo(() => ({ announce }), [announce]);

  return (
    <LiveContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only-live">
        {text}
      </div>
    </LiveContext.Provider>
  );
}

export function useLiveStatus(): LiveApi {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLiveStatus must be used inside <LiveStatusProvider>");
  return ctx;
}
