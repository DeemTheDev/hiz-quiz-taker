"use client";

/**
 * Tiny external store for user settings (sound / motion / haptics), consumed
 * via useSyncExternalStore so hydration never mismatches: the server snapshot
 * is the defaults, the client snapshot reads localStorage once.
 */

import { isSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { setHapticsEnabled } from "@/lib/haptics";

const MOTION_KEY = "hq:motion";
const HAPTICS_KEY = "hq:haptics";

export interface SettingsState {
  sound: boolean;
  /** true = animations on (in-page toggle) */
  motion: boolean;
  haptics: boolean;
  canVibrate: boolean;
  /** false only in the server snapshot */
  ready: boolean;
}

const SERVER_SNAPSHOT: SettingsState = {
  sound: true,
  motion: true,
  haptics: true,
  canVibrate: false,
  ready: false,
};

let state: SettingsState | null = null;
const listeners = new Set<() => void>();

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

function writeBool(key: string, v: boolean) {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function init(): SettingsState {
  if (state) return state;
  const haptics = readBool(HAPTICS_KEY, true);
  setHapticsEnabled(haptics);
  state = {
    sound: isSoundEnabled(),
    motion: readBool(MOTION_KEY, true),
    haptics,
    canVibrate: typeof navigator !== "undefined" && "vibrate" in navigator,
    ready: true,
  };
  return state;
}

function update(patch: Partial<SettingsState>) {
  state = { ...init(), ...patch };
  listeners.forEach((l) => l());
}

export function getSettingsSnapshot(): SettingsState {
  return init();
}

export function getSettingsServerSnapshot(): SettingsState {
  return SERVER_SNAPSHOT;
}

export function subscribeSettings(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setSound(on: boolean) {
  setSoundEnabled(on);
  update({ sound: on });
}

export function setMotion(on: boolean) {
  writeBool(MOTION_KEY, on);
  update({ motion: on });
}

export function setHaptics(on: boolean) {
  setHapticsEnabled(on);
  writeBool(HAPTICS_KEY, on);
  update({ haptics: on });
}
