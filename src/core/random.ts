/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Produces deterministic sequences from a 32-bit integer seed.
 */

/** Internal state after seeding. */
type RngState = { state: number };

/** Create a new PRNG state from a seed. */
export function createRng(seed: number): RngState {
  return { state: seed | 0 };
}

/**
 * Return the next pseudo-random float in [0, 1) and advance the state.
 * Algorithm: Mulberry32 — fast, simple, good distribution for our needs.
 */
export function nextFloat(rng: RngState): number {
  rng.state = (rng.state + 0x6d2b79f5) | 0;
  let t = Math.imul(rng.state ^ (rng.state >>> 15), 1 | rng.state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
}

/** Return the next pseudo-random integer in [min, max] (inclusive). */
export function nextInt(rng: RngState, min: number, max: number): number {
  return min + Math.floor(nextFloat(rng) * (max - min + 1));
}
