/**
 * Predefined 3×3 kernels used as cartographer's tools.
 *
 * Metaphor mapping:
 *   boxBlur   → brouillard (fog)
 *   gaussian  → brume légère (light mist)
 *   sharpen   → jumelles (binoculars)
 *   laplacian → crêtes et falaises (ridges & cliffs)
 *   emboss    → ombrage du relief (hillshade)
 *   sobelX    → pentes est–ouest (east–west slopes)
 *   sobelY    → pentes nord–sud (north–south slopes)
 */

import type { Kernel2D } from './convolve2d';

/* ------------------------------------------------------------------ */
/*  Blur kernels — sum of coefficients equals their divisor           */
/* ------------------------------------------------------------------ */

/** Box blur (uniform average): every neighbour weighted equally. */
export const boxBlur: Kernel2D = {
  values: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  divisor: 9,
  offset: 0,
} as const;

/** Gaussian-approximation blur: centre weighted more than corners. */
export const gaussian: Kernel2D = {
  values: [1, 2, 1, 2, 4, 2, 1, 2, 1],
  divisor: 16,
  offset: 0,
} as const;

/* ------------------------------------------------------------------ */
/*  Edge / detail kernels                                             */
/* ------------------------------------------------------------------ */

/** Sharpening: boosts the centre, subtracts the 4-neighbours. */
export const sharpen: Kernel2D = {
  values: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  divisor: 1,
  offset: 0,
} as const;

/**
 * Laplacian (8-connected): detects edges in all directions.
 * A uniform region yields 0 because the sum of coefficients is 0.
 */
export const laplacian: Kernel2D = {
  values: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  divisor: 1,
  offset: 0,
} as const;

/** Emboss: gives a 3-D raised appearance (offset by 128 for display). */
export const emboss: Kernel2D = {
  values: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
  divisor: 1,
  offset: 128,
} as const;

/* ------------------------------------------------------------------ */
/*  Sobel gradient operators                                          */
/* ------------------------------------------------------------------ */

/** Sobel X: horizontal gradient (detects vertical edges). */
export const sobelX: Kernel2D = {
  values: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  divisor: 1,
  offset: 0,
} as const;

/** Sobel Y: vertical gradient (detects horizontal edges). */
export const sobelY: Kernel2D = {
  values: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
  divisor: 1,
  offset: 0,
} as const;
