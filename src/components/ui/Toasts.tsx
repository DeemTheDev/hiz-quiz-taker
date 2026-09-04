"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useLiveStatus } from "@/components/ui/LiveStatus";

export type ToastVariant = "lemon" | "mint" | "violet" | "sky";

export interface ToastInput {
  text: string;
  variant?: ToastVariant;
  /** ms visible; default 1200 */
  duration?: number;
  /** higher wins when several are queued in the same beat */
  priority?: number;
  /** full-width banner instead of a corner toast */
  banner?: boolean;
  /** de-dupe key: a toast with the same key already queued/shown is skipped */
  key?: string;
  /** Mirror the text to the shared aria-live region (default true; "force" bypasses its throttle). */
  announce?: boolean | "force";
}

interface Toast extends Required<Omit<ToastInput, "key" | "announce">> {
  id: number;
  key: string;
}

interface ToastApi {
  toast: (t: ToastInput) => void;
  /** Drop anything queued but not yet shown (e.g. on screen change). */
  clearQueue: () => void;
}

/**
 * One toast at a time, priority-sorted queue, pointer-events none, never
 * blocks anything. Plain class so timers can chain without React re-entrancy.
 */
class ToastManager {
  private queue: Toast[] = [];
  private current: Toast | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();
  private nextId = 0;

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getSnapshot = () => this.current;

  enqueue(t: ToastInput) {
    const key = t.key ?? t.text;
    if (this.current?.key === key || this.queue.some((q) => q.key === key)) return;
    this.queue.push({
      id: ++this.nextId,
      key,
      text: t.text,
      variant: t.variant ?? "lemon",
      duration: t.duration ?? 1200,
      priority: t.priority ?? 0,
      banner: t.banner ?? false,
    });
    if (!this.current && !this.timer) this.advance();
  }

  clearQueue() {
    this.queue = [];
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private advance() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue.sort((a, b) => b.priority - a.priority);
    const next = this.queue.shift() ?? null;
    this.current = next;
    this.emit();
    if (!next) return;
    this.timer = setTimeout(() => {
      this.current = null;
      this.emit();
      // small gap between toasts
      this.timer = setTimeout(() => {
        this.timer = null;
        this.advance();
      }, 180);
    }, next.duration);
  }
}

const ToastContext = createContext<ToastApi | null>(null);

const variantClass: Record<ToastVariant, string> = {
  lemon: "bg-lemon text-ink-lemon border-ink",
  mint: "bg-mint text-ink-mint border-mint-edge",
  violet: "bg-violet-700 text-white border-violet-700",
  sky: "bg-sky text-ink-sky border-ink",
};

const getServerSnapshot = () => null;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mgr] = useState(() => new ToastManager());
  const current = useSyncExternalStore(mgr.subscribe, mgr.getSnapshot, getServerSnapshot);
  const { announce } = useLiveStatus();

  const api = useMemo<ToastApi>(
    () => ({
      toast: (t) => {
        mgr.enqueue(t);
        if (t.announce !== false) announce(t.text, { force: t.announce === "force" });
      },
      clearQueue: () => mgr.clearQueue(),
    }),
    [mgr, announce],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="off"
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <AnimatePresence>
          {current && (
            <m.div
              key={current.id}
              initial={{ y: current.banner ? -40 : -24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 500, damping: 18, mass: 0.7 }}
              className={[
                "rounded-chip border-2 px-4 py-2.5 text-body font-extrabold shadow-toast",
                current.banner ? "w-full max-w-[430px] text-center" : "max-w-[92vw]",
                variantClass[current.variant],
              ].join(" ")}
            >
              {current.text}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
