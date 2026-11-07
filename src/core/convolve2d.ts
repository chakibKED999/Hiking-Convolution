/**
 * 2-D convolution with a 3×3 kernel.
 * Supports cross-correlation (default) and true convolution (flipped kernel).
 */

import { type Grid, type BorderMode, createGrid, getPixel, clampByte } from './grid';

/** Size of the supported kernel side. */
const KERNEL_SIZE = 3;

/** A 3×3 convolution kernel with its divisor and offset. */
export interface Kernel2D {
  /** 9 coefficients in row-major order. */
  readonly values: readonly number[];
  /** Sum divisor applied after the dot product (e.g. 16 for gaussian). */
  readonly divisor: number;
  /** Added after division (useful for emboss / laplacian visualisation). */
  readonly offset: number;
}

/** Options for the 2-D convolution. */
export interface Convolve2DOptions {
  /** Border extension mode (default: 'clamp'). */
  borderMode?: BorderMode;
  /**
   * When true, the kernel is flipped (180° rotation) before application,
   * performing a mathematical convolution instead of cross-correlation.
   */
  flipKernel?: boolean;
}

/**
 * Apply a 3×3 kernel to every pixel of a grid.
 * Returns a **new** grid — the source is never mutated.
 */
export function convolve2d(
  src: Grid,
  kernel: Kernel2D,
  options: Convolve2DOptions = {},
): Grid {
  const { borderMode = 'clamp', flipKernel = false } = options;
  const { width, height } = src;
  const out = createGrid(width, height);

  /* Pre-build the (possibly flipped) coefficient array for speed. */
  const k: number[] = flipKernel
    ? [...kernel.values].reverse()
    : (kernel.values.slice() as number[]);

  const half = Math.floor(KERNEL_SIZE / 2); // 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const ki = (ky + half) * KERNEL_SIZE + (kx + half);
          sum += getPixel(src, x + kx, y + ky, borderMode) * (k[ki] ?? 0);
        }
      }
      out.data[y * width + x] = clampByte(sum / kernel.divisor + kernel.offset);
    }
  }

  return out;
}
