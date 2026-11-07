/**
 * 1-D convolution for altitude profiles (single-row signal).
 */

import { clampByte } from './grid';

/** A 1-D kernel with its coefficients, divisor and offset. */
export interface Kernel1D {
  readonly values: readonly number[];
  readonly divisor: number;
  readonly offset: number;
}

/**
 * Convolve a 1-D signal with a 1-D kernel.
 * Uses 'clamp' border extension (repeats the nearest edge value).
 * When `flipKernel` is true, the kernel is reversed (true convolution);
 * otherwise cross-correlation is performed.
 */
export function convolve1d(
  signal: readonly number[],
  kernel: Kernel1D,
  flipKernel: boolean = false,
): number[] {
  const len = signal.length;
  const kLen = kernel.values.length;
  const halfK = Math.floor(kLen / 2);
  const result: number[] = new Array<number>(len);

  const k = flipKernel ? [...kernel.values].reverse() : [...kernel.values];

  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let j = 0; j < kLen; j++) {
      const idx = i + j - halfK;
      const clamped = Math.max(0, Math.min(len - 1, idx));
      sum += (signal[clamped] ?? 0) * (k[j] ?? 0);
    }
    result[i] = clampByte(sum / kernel.divisor + kernel.offset);
  }

  return result;
}
