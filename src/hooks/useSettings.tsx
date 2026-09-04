"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation, useReducedMotion } from "motion/react";
import {
  getSettingsServerSnapshot,
  getSettingsSnapshot,
  setHaptics,
  setMotion,
  setSound,
  subscribeSettings,
  type SettingsState,
} from "@/lib/settings-store";

interface Settings extends SettingsState {
  /** effective: OS prefers-reduced-motion OR in-page toggle off */
  reduceMotion: boolean;
  setSound: (on: boolean) => void;
  setMotion: (on: boolean) => void;
  setHaptics: (on: boolean) => void;
}

const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const s = useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getSettingsServerSnapshot);
  const osReduced = useReducedMotion(); // null on first render
  const reduceMotion = !s.motion || osReduced === true;

  // Mirror the effective motion preference onto <html> for CSS.
  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "off" : "on";
  }, [reduceMotion]);

  const value = useMemo<Settings>(
    () => ({ ...s, reduceMotion, setSound, setMotion, setHaptics }),
    [s, reduceMotion],
  );

  return (
    <SettingsContext.Provider value={value}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion={s.motion ? "user" : "always"}>{children}</MotionConfig>
      </LazyMotion>
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
