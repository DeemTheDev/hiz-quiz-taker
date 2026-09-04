"use client";

/**
 * Zero-asset sound engine built on the Web Audio API (see docs/DESIGN.md §7).
 *
 * - Every cue is synthesized (OscillatorNode + GainNode, one BiquadFilterNode
 *   where the recipe asks for it, plus a single 1 s white-noise AudioBuffer
 *   generated once and reused). No audio files, nothing fetched.
 * - One shared AudioContext, created and `resume()`d inside a user gesture:
 *   call `unlockAudio()` (or `playOnGesture()`) from the Start Quiz click.
 *   Until that happens `play()` is a silent no-op — sound is ON by default
 *   but never starts before the first tap.
 * - `resume()` is called defensively on every `play()` and when the page
 *   becomes visible again (iOS suspends/interrupts contexts in the background).
 * - iOS silent switch is respected: no `navigator.audioSession` tweaks, no
 *   silent-<audio> unmute hack. This link is opened in taxis and classrooms.
 * - Envelopes: linear attack, exponential release to 0.001, then a short
 *   linear tail to 0 — gain never jumps, so no clicks.
 * - Scheduler: distinct cues need >= 300 ms between onsets or the later one is
 *   dropped; `tick` has its own 40 ms throttle and `tap`/`select` (direct UI
 *   feedback) always play. Success vs failure differ by pitch direction and
 *   timbre, never by volume.
 *
 * This module is imported by client components that are also server-rendered:
 * nothing here touches `window`, `document` or `localStorage` at import time.
 */

const STORAGE_KEY = "hq:sound";
const MASTER_GAIN = 0.4;
/** Floor for exponential ramps (they cannot reach 0). */
const MIN_GAIN = 0.001;
/** Small look-ahead so the first automation point is never in the past. */
const LOOKAHEAD = 0.005;
/** Linear fade from MIN_GAIN to 0 after each envelope, before the node stops. */
const TAIL = 0.02;
const CUE_SPACING_MS = 300;
const TICK_THROTTLE_MS = 40;

export type Cue =
  | "tap"
  | "select"
  | "correct"
  | "wrong"
  | "streak"
  /** `streak` short variant (first two notes) — sticker / kit unlock. */
  | "kit"
  | "levelup"
  | "whoosh"
  | "tick"
  | "fanfare"
  /** Results stamp. */
  | "thud"
  | "pop";

/** Direct UI feedback: never dropped by the 300 ms spacing rule. */
const ALWAYS_PLAY: ReadonlySet<Cue> = new Set<Cue>(["tap", "select"]);

const NOTE = {
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  C6: 1046.5,
  G6: 1567.98,
  C7: 2093,
} as const;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled: boolean | null = null; // lazily read from storage
let unlocked = false;
let visibilityHooked = false;
let lastOnsetMs = -Infinity; // wall-clock onset of the last spaced cue
let lastTickMs = -Infinity;

/* ----------------------------------------------------------------------------
 * Preference
 * ------------------------------------------------------------------------- */

function readEnabled(): boolean {
  if (enabled !== null) return enabled;
  try {
    const v = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    enabled = v === null ? true : v === "1";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function isSoundEnabled(): boolean {
  return readEnabled();
}

/**
 * Persist the toggle. Turning sound ON unlocks the context (call from the
 * toggle's click handler) and plays a single `tick` so the user hears that it
 * worked; turning it OFF is silent.
 */
export function setSoundEnabled(on: boolean): void {
  const was = readEnabled();
  enabled = on;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    }
  } catch {
    /* ignore */
  }
  if (on) {
    unlockAudio();
    if (!was) play("tick");
  }
}

/* ----------------------------------------------------------------------------
 * Context lifecycle
 * ------------------------------------------------------------------------- */

function resume(c: AudioContext): void {
  if (c.state === "running") return;
  try {
    void c.resume().catch(() => {});
  } catch {
    /* ignore */
  }
}

function hookVisibility(): void {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ctx && ctx.state !== "running") {
      resume(ctx);
    }
  });
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    const c = new AC();
    const m = c.createGain();
    m.gain.value = MASTER_GAIN;
    m.connect(c.destination);
    ctx = c;
    master = m;
  } catch {
    ctx = null;
    master = null;
    return null;
  }
  hookVisibility();
  return ctx;
}

/**
 * Call from a user gesture (the Start Quiz click) to satisfy autoplay
 * policies: creates/resumes the shared context, plays a 1-sample silent
 * buffer (fully unlocks iOS) and pre-builds the noise buffer.
 */
export function unlockAudio(): void {
  const c = getContext();
  if (!c) return;
  resume(c);
  if (!unlocked) {
    unlocked = true;
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, c.sampleRate);
      src.connect(c.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
  }
  warmup();
}

/**
 * Pre-create the shared 1 s white-noise buffer so the first `whoosh`/`thud`/
 * `streak` does not pay for it. No-op until a context exists (never creates
 * one outside a gesture).
 */
export function warmup(): void {
  if (ctx) getNoise(ctx);
}

function getNoise(c: AudioContext): AudioBuffer | null {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate) return noiseBuffer;
  try {
    const len = Math.max(1, Math.floor(c.sampleRate)); // 1 s
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
  } catch {
    return null;
  }
  return noiseBuffer;
}

/* ----------------------------------------------------------------------------
 * Synthesis helpers
 * ------------------------------------------------------------------------- */

function clamp(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x)) return lo;
  return Math.min(hi, Math.max(lo, x));
}

/** Frequencies must stay > 0 for exponential ramps; treat junk as 1 Hz. */
function safeHz(x: number): number {
  return Number.isFinite(x) && x >= 1 ? x : 1;
}

interface FilterSpec {
  type: BiquadFilterType;
  freq: number;
  /** Optional cutoff sweep target, reached at the end of the sound. */
  to?: number;
  q?: number;
}

interface ToneSpec {
  type?: OscillatorType;
  freq: number;
  /** Optional glide target, reached at the end of the sound. */
  to?: number;
  /** Glide curve (default exponential — natural for pitch). */
  glide?: "linear" | "exponential";
  /** Onset offset from the cue start, seconds. */
  at?: number;
  /** Seconds, attack + hold + release. */
  dur: number;
  peak: number;
  attack?: number;
  release?: number;
  /** Cents. */
  detune?: number;
  filter?: FilterSpec;
}

interface NoiseSpec {
  at?: number;
  dur: number;
  peak: number;
  attack?: number;
  release?: number;
  filter: FilterSpec;
}

/**
 * Linear attack → hold → exponential release to MIN_GAIN → linear tail to 0.
 * Attack/release are clamped so every breakpoint is in non-decreasing order.
 */
function envelope(
  c: AudioContext,
  t0: number,
  dur: number,
  peak: number,
  attack: number,
  release: number,
): GainNode {
  const g = c.createGain();
  const p = Math.max(MIN_GAIN, Number.isFinite(peak) ? peak : MIN_GAIN);
  const d = Math.max(0.004, Number.isFinite(dur) ? dur : 0.004);
  const a = clamp(attack, 0.001, d / 2);
  const r = clamp(release, 0.001, d - a);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(p, t0 + a);
  g.gain.setValueAtTime(p, t0 + d - r);
  g.gain.exponentialRampToValueAtTime(MIN_GAIN, t0 + d);
  g.gain.linearRampToValueAtTime(0, t0 + d + TAIL);
  return g;
}

function makeFilter(c: AudioContext, spec: FilterSpec, t0: number, dur: number): BiquadFilterNode {
  const f = c.createBiquadFilter();
  f.type = spec.type;
  f.frequency.setValueAtTime(safeHz(spec.freq), t0);
  if (spec.to !== undefined) {
    f.frequency.exponentialRampToValueAtTime(safeHz(spec.to), t0 + dur);
  }
  if (spec.q !== undefined) f.Q.value = spec.q;
  return f;
}

function tone(c: AudioContext, out: AudioNode, base: number, s: ToneSpec): void {
  const t0 = base + Math.max(0, s.at ?? 0);
  const dur = Math.max(0.004, s.dur);
  const osc = c.createOscillator();
  osc.type = s.type ?? "sine";
  osc.frequency.setValueAtTime(safeHz(s.freq), t0);
  if (s.to !== undefined) {
    const target = safeHz(s.to);
    if (s.glide === "linear") osc.frequency.linearRampToValueAtTime(target, t0 + dur);
    else osc.frequency.exponentialRampToValueAtTime(target, t0 + dur);
  }
  if (s.detune) osc.detune.value = s.detune;

  const env = envelope(c, t0, dur, s.peak, s.attack ?? 0.005, s.release ?? 0.08);
  let head: AudioNode = osc;
  if (s.filter) {
    const f = makeFilter(c, s.filter, t0, dur);
    head.connect(f);
    head = f;
  }
  head.connect(env);
  env.connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + TAIL + 0.01);
}

/** Plays a slice of the shared noise buffer (random offset, looped) through a filter. */
function noise(c: AudioContext, out: AudioNode, base: number, s: NoiseSpec): void {
  const buf = getNoise(c);
  if (!buf) return;
  const t0 = base + Math.max(0, s.at ?? 0);
  const dur = Math.max(0.004, s.dur);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const f = makeFilter(c, s.filter, t0, dur);
  const env = envelope(c, t0, dur, s.peak, s.attack ?? 0.005, s.release ?? dur * 0.6);
  src.connect(f);
  f.connect(env);
  env.connect(out);
  src.start(t0, Math.random() * buf.duration);
  src.stop(t0 + dur + TAIL + 0.01);
}

/**
 * Fanfare drumroll: sine 130→260 Hz over 1.2 s, amplitude-modulated by an LFO
 * that speeds up 12→30 Hz (depth 0.5, i.e. gain swings 0.5…1.0), swelling
 * from half to full peak 0.12 before resolving into the chord.
 */
function drumroll(c: AudioContext, out: AudioNode, t0: number): void {
  const dur = 1.2;
  const peak = 0.12;

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, t0);
  osc.frequency.exponentialRampToValueAtTime(260, t0 + dur);

  const trem = c.createGain();
  trem.gain.setValueAtTime(0.75, t0); // centre of the 0.5…1.0 swing
  const lfo = c.createOscillator();
  lfo.type = "triangle";
  lfo.frequency.setValueAtTime(12, t0);
  lfo.frequency.linearRampToValueAtTime(30, t0 + dur);
  const lfoAmp = c.createGain();
  lfoAmp.gain.setValueAtTime(0.25, t0); // ±0.25 around the centre → depth 0.5
  lfo.connect(lfoAmp);
  lfoAmp.connect(trem.gain);

  const env = c.createGain();
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(peak * 0.5, t0 + 0.04);
  env.gain.linearRampToValueAtTime(peak, t0 + dur - 0.1);
  env.gain.exponentialRampToValueAtTime(MIN_GAIN, t0 + dur);
  env.gain.linearRampToValueAtTime(0, t0 + dur + TAIL);

  osc.connect(trem);
  trem.connect(env);
  env.connect(out);
  const stopAt = t0 + dur + TAIL + 0.01;
  osc.start(t0);
  lfo.start(t0);
  osc.stop(stopAt);
  lfo.stop(stopAt);
}

/* ----------------------------------------------------------------------------
 * Cue recipes (docs/DESIGN.md §7 table)
 * ------------------------------------------------------------------------- */

type Recipe = (c: AudioContext, out: AudioNode, t0: number) => void;

function streakNotes(c: AudioContext, out: AudioNode, t0: number, count: number): void {
  const freqs = [880, 1108.73, 1318.51, 1760].slice(0, count);
  freqs.forEach((f, i) =>
    tone(c, out, t0, { freq: f, at: i * 0.06, dur: 0.14, peak: 0.18, attack: 0.005, release: 0.09 }),
  );
}

const RECIPES: Record<Cue, Recipe> = {
  // 50 ms — quietest cue; every button press.
  tap: (c, out, t0) => {
    tone(c, out, t0, {
      freq: 520,
      to: 660,
      glide: "linear",
      dur: 0.05,
      peak: 0.18,
      attack: 0.003,
      release: 0.04,
    });
  },

  // 80 ms — a light "lock" when an option is tapped.
  select: (c, out, t0) => {
    tone(c, out, t0, { freq: 1200, dur: 0.02, peak: 0.12, attack: 0.002, release: 0.018 });
    tone(c, out, t0, {
      freq: 180,
      to: 120,
      dur: 0.08,
      peak: 0.16,
      attack: 0.003,
      release: 0.06,
      filter: { type: "lowpass", freq: 600 },
    });
  },

  // 400 ms — rising major arpeggio C5 E5 G5 with a detuned double and a G6 sparkle.
  correct: (c, out, t0) => {
    const notes: ReadonlyArray<readonly [freq: number, at: number, dur: number]> = [
      [NOTE.C5, 0, 0.12],
      [NOTE.E5, 0.09, 0.12],
      [NOTE.G5, 0.18, 0.22],
    ];
    for (const [freq, at, dur] of notes) {
      tone(c, out, t0, { type: "triangle", freq, at, dur, peak: 0.3, attack: 0.005, release: 0.08 });
      tone(c, out, t0, {
        type: "triangle",
        freq,
        at,
        dur,
        peak: 0.1,
        attack: 0.005,
        release: 0.08,
        detune: 6,
      });
    }
    tone(c, out, t0, { freq: NOTE.G6, at: 0.18, dur: 0.22, peak: 0.08, attack: 0.005, release: 0.08 });
  },

  // 300 ms — soft, low, falling; informational, never a buzzer.
  wrong: (c, out, t0) => {
    tone(c, out, t0, { freq: 330, to: 196, dur: 0.26, peak: 0.26, attack: 0.015, release: 0.15 });
    tone(c, out, t0, {
      type: "triangle",
      freq: 165,
      to: 110,
      dur: 0.3,
      peak: 0.1,
      attack: 0.015,
      release: 0.15,
      filter: { type: "lowpass", freq: 800, q: 0.7 },
    });
  },

  // 320 ms — four rising sparkle notes + a high-passed shimmer.
  streak: (c, out, t0) => {
    streakNotes(c, out, t0, 4);
    noise(c, out, t0, {
      dur: 0.25,
      peak: 0.04,
      attack: 0.01,
      release: 0.15,
      filter: { type: "highpass", freq: 3000 },
    });
  },

  // 200 ms — streak short variant: first two notes only (sticker / kit unlock).
  kit: (c, out, t0) => {
    streakNotes(c, out, t0, 2);
  },

  // 25 ms — count-up tick (XP, score). Throttled to one per 40 ms.
  tick: (c, out, t0) => {
    tone(c, out, t0, { type: "square", freq: 1200, dur: 0.025, peak: 0.06, attack: 0.001, release: 0.02 });
  },

  // 220 ms — band-passed noise sweep; rare-fact cards / sheet rise garnish.
  whoosh: (c, out, t0) => {
    noise(c, out, t0, {
      dur: 0.22,
      peak: 0.08,
      attack: 0.03,
      release: 0.12,
      filter: { type: "bandpass", freq: 400, to: 4000, q: 1.2 },
    });
  },

  // ≈2.46 s — drumroll 0–1.2 s, then C5 E5 G5 C6 staggered 120 ms with shimmer and a held C6.
  fanfare: (c, out, t0) => {
    drumroll(c, out, t0);
    const resolve = 1.2;
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((freq, i) =>
      tone(c, out, t0, {
        type: "triangle",
        freq,
        at: resolve + i * 0.12,
        dur: 0.28,
        peak: 0.26,
        attack: 0.005,
        release: 0.1,
      }),
    );
    const top = resolve + 0.36;
    tone(c, out, t0, { freq: NOTE.C7, at: top, dur: 0.6, peak: 0.06, attack: 0.01, release: 0.35 });
    tone(c, out, t0, { freq: NOTE.C6, at: top, dur: 0.9, peak: 0.18, attack: 0.02, release: 0.5 });
  },

  // 90 ms — results stamp: low-passed noise hit + a falling sine.
  thud: (c, out, t0) => {
    noise(c, out, t0, {
      dur: 0.06,
      peak: 0.3,
      attack: 0.002,
      release: 0.05,
      filter: { type: "lowpass", freq: 300 },
    });
    tone(c, out, t0, { freq: 110, to: 70, dur: 0.09, peak: 0.26, attack: 0.002, release: 0.08 });
  },

  // 90 ms — small bright pop (kept from v1, level aligned to the new mix).
  pop: (c, out, t0) => {
    tone(c, out, t0, { type: "triangle", freq: 300, to: 900, dur: 0.09, peak: 0.2, attack: 0.003, release: 0.06 });
  },

  // 820 ms — C5 E5 G5 C6 staggered 80 ms + held C6 (kept from v1, level aligned).
  levelup: (c, out, t0) => {
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((freq, i) =>
      tone(c, out, t0, { type: "triangle", freq, at: i * 0.08, dur: 0.2, peak: 0.24, attack: 0.005, release: 0.08 }),
    );
    tone(c, out, t0, { freq: NOTE.C6, at: 0.32, dur: 0.5, peak: 0.18, attack: 0.01, release: 0.3 });
  },
};

/* ----------------------------------------------------------------------------
 * Scheduler + public play API
 * ------------------------------------------------------------------------- */

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/**
 * Wall-clock spacing (independent of the context clock, which freezes while
 * suspended): `tick` gets its own 40 ms throttle, `tap`/`select` always pass
 * and never count as an onset, every other cue needs >= 300 ms since the
 * previous spaced cue or it is dropped.
 */
function admit(cue: Cue): boolean {
  const now = nowMs();
  if (cue === "tick") {
    if (now - lastTickMs < TICK_THROTTLE_MS) return false;
    lastTickMs = now;
    return true;
  }
  if (ALWAYS_PLAY.has(cue)) return true;
  if (now - lastOnsetMs < CUE_SPACING_MS) return false;
  lastOnsetMs = now;
  return true;
}

/**
 * Play a named cue. Safe to call anywhere: no-ops when muted, unsupported, or
 * before `unlockAudio()` has run inside a gesture. Never throws into the UI.
 */
export function play(cue: Cue): void {
  if (!unlocked || !readEnabled()) return;
  const c = ctx;
  const out = master;
  if (!c || !out) return;
  if (c.state !== "running") {
    resume(c);
    // Only gesture-driven cues may queue into a suspended context (they will
    // sound the moment the resume above lands). Timer-driven cues are dropped
    // so a stalled context never releases a pile of sounds at once.
    if (!ALWAYS_PLAY.has(cue)) return;
  }
  if (!admit(cue)) return;
  try {
    RECIPES[cue](c, out, c.currentTime + LOOKAHEAD);
  } catch {
    /* never let audio break the UI */
  }
}

/** Convenience wrapper: unlocks then plays (use inside gesture handlers). */
export function playOnGesture(cue: Cue): void {
  unlockAudio();
  play(cue);
}
