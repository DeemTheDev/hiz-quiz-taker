/**
 * Small deterministic PRNG + shuffle helpers.
 *
 * We shuffle the answer order per attempt so the correct answer isn't always
 * in the same position, but we keep the mapping so stats use canonical indices.
 */

/** mulberry32: tiny, fast, good-enough 32-bit PRNG. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a new array with the elements of `arr` in shuffled order (Fisher–Yates). */
export function shuffleWithRng<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * For each question, a permutation of canonical option indices [0,1,2,3]
 * describing display order: displayOrder[q][position] = canonicalIndex.
 */
export function buildDisplayOrders(questionCount: number, seed: number): number[][] {
  const rng = createRng(seed);
  const orders: number[][] = [];
  for (let q = 0; q < questionCount; q++) {
    orders.push(shuffleWithRng([0, 1, 2, 3], rng));
  }
  return orders;
}

/** A fresh random seed (not for security; just variety between attempts). */
export function randomSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}
