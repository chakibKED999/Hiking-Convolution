/**
 * 2D Kernel composition and 5x5 convolution.
 * Demonstrates that applying two successive 3x3 box blurs is mathematically
 * equivalent to applying a single 5x5 pyramidal/triangular blur kernel.
 */

import { type Grid, type BorderMode, createGrid, getPixel, clampByte } from './grid';
import type { Kernel2D } from './convolve2d';

/** 5x5 kernel coefficients for two successive 3x3 box blurs (div: 81). */
export const DOUBLE_BOX_BLUR_5X5_VALUES: readonly number[] = [
  1, 2, 3, 2, 1, 2, 4, 6, 4, 2, 3, 6, 9, 6, 3, 2, 4, 6, 4, 2, 1, 2, 3, 2, 1,
] as const;

export const DOUBLE_BOX_BLUR_5X5_DIVISOR = 81;

/**
 * Mathematically composes two 3x3 kernels into a single 5x5 kernel (25 coefficients).
 * Uses continuous 2D discrete convolution of the two 3x3 matrices.
 */
export function composeKernels3x3(
  k1: Kernel2D,
  k2: Kernel2D,
): { values: number[]; divisor: number; offset: number } {
  const result = new Array<number>(25).fill(0);

  for (let y1 = 0; y1 < 3; y1++) {
    for (let x1 = 0; x1 < 3; x1++) {
      const v1 = k1.values[y1 * 3 + x1] ?? 0;

      for (let y2 = 0; y2 < 3; y2++) {
        for (let x2 = 0; x2 < 3; x2++) {
          const v2 = k2.values[y2 * 3 + x2] ?? 0;
          const outX = x1 + x2; // in [0, 4]
          const outY = y1 + y2; // in [0, 4]
          result[outY * 5 + outX] = (result[outY * 5 + outX] ?? 0) + v1 * v2;
        }
      }
    }
  }

  return {
    values: result,
    divisor: k1.divisor * k2.divisor,
    offset: 0,
  };
}

/**
 * Convolve a 2D Grid with an arbitrary 5x5 kernel.
 */
export function convolve5x5(
  src: Grid,
  values25: readonly number[],
  divisor: number,
  offset = 0,
  borderMode: BorderMode = 'clamp',
): Grid {
  const { width, height } = src;
  const out = createGrid(width, height);
  const half = 2; // radius for 5x5

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const ki = (ky + half) * 5 + (kx + half);
          const coeff = values25[ki] ?? 0;
          const pixelVal = getPixel(src, x + kx, y + ky, borderMode);
          sum += pixelVal * coeff;
        }
      }

      out.data[y * width + x] = clampByte(sum / divisor + offset);
    }
  }

  return out;
}
