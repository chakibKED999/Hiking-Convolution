/**
 * Grid similarity metrics and scoring functions for challenges and guides.
 * Pure TypeScript — no React, no DOM.
 */

import type { Grid } from './grid';

/**
 * Compute the Mean Absolute Error (MAE) between two grids of the same dimensions.
 * MAE = (1 / N) * sum(|a[i] - b[i]|).
 */
export function meanAbsoluteError(a: Grid, b: Grid): number {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error('Grids must have the same dimensions to compute MAE');
  }

  const len = a.width * a.height;
  if (len === 0) return 0;

  let totalDiff = 0;
  for (let i = 0; i < len; i++) {
    const valA = a.data[i] ?? 0;
    const valB = b.data[i] ?? 0;
    totalDiff += Math.abs(valA - valB);
  }

  return totalDiff / len;
}

/**
 * Compute a similarity score in [0, 100] based on MAE.
 * Score = 100 * max(0, 1 - (MAE / maxErrorThreshold)).
 * Default maxErrorThreshold is 64 altitude units.
 */
export function calculateSimilarityScore(
  actual: Grid,
  target: Grid,
  maxErrorThreshold = 64,
): number {
  const mae = meanAbsoluteError(actual, target);
  const normalized = Math.max(0, 1 - mae / maxErrorThreshold);
  return Math.round(normalized * 100);
}
