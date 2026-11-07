/**
 * Gradient magnitude and partial derivatives from Sobel X and Sobel Y operators.
 * Produces slope maps and directional terrain gradient components.
 */

import { type Grid, createGrid, clampByte } from './grid';
import { sobelX, sobelY } from './kernels';
import type { BorderMode } from './grid';

/**
 * Compute the gradient magnitude at every pixel: sqrt(gx² + gy²).
 *
 * Because Sobel kernels have divisor 1, their raw output can exceed [0, 255].
 * We need the **un-clamped** partial derivatives, so we recompute them here
 * without the clampByte step, then combine and clamp once.
 */
export function slopeMap(src: Grid, borderMode: BorderMode = 'clamp'): Grid {
  const { width, height } = src;
  const out = createGrid(width, height);

  const gxK = sobelX.values;
  const gyK = sobelY.values;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = getPixelRaw(src, x + kx, y + ky, borderMode);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += px * (gxK[ki] ?? 0);
          gy += px * (gyK[ki] ?? 0);
        }
      }
      out.data[y * width + x] = clampByte(Math.sqrt(gx * gx + gy * gy));
    }
  }

  return out;
}

/**
 * Compute the individual Sobel X and Sobel Y directional components alongside the magnitude.
 * The directional components are scaled & centered at 128 for grayscale display:
 * val = clampByte(128 + raw / 4) so neutral slope is gray (128).
 */
export function sobelComponents(
  src: Grid,
  borderMode: BorderMode = 'clamp',
): {
  gxVisual: Grid;
  gyVisual: Grid;
  magnitude: Grid;
  rawGx: number[];
  rawGy: number[];
} {
  const { width, height } = src;
  const gxVisual = createGrid(width, height);
  const gyVisual = createGrid(width, height);
  const magnitude = createGrid(width, height);
  const rawGx = new Array<number>(width * height);
  const rawGy = new Array<number>(width * height);

  const gxK = sobelX.values;
  const gyK = sobelY.values;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = getPixelRaw(src, x + kx, y + ky, borderMode);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += px * (gxK[ki] ?? 0);
          gy += px * (gyK[ki] ?? 0);
        }
      }

      const idx = y * width + x;
      rawGx[idx] = gx;
      rawGy[idx] = gy;
      gxVisual.data[idx] = clampByte(128 + gx / 4);
      gyVisual.data[idx] = clampByte(128 + gy / 4);
      magnitude.data[idx] = clampByte(Math.sqrt(gx * gx + gy * gy));
    }
  }

  return { gxVisual, gyVisual, magnitude, rawGx, rawGy };
}

/**
 * Locate the pixel with the highest slope magnitude in a grid.
 */
export function findSteepestPixel(magnitude: Grid): {
  x: number;
  y: number;
  maxSlope: number;
} {
  const { width, height, data } = magnitude;
  let maxSlope = -1;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = data[y * width + x] ?? 0;
      if (val > maxSlope) {
        maxSlope = val;
        maxX = x;
        maxY = y;
      }
    }
  }

  return { x: maxX, y: maxY, maxSlope };
}

/**
 * Raw pixel access with border handling.
 */
function getPixelRaw(grid: Grid, x: number, y: number, mode: BorderMode): number {
  const { width, height, data } = grid;
  if (x >= 0 && x < width && y >= 0 && y < height) {
    return data[y * width + x] ?? 0;
  }
  switch (mode) {
    case 'zero':
      return 0;
    case 'wrap':
      x = ((x % width) + width) % width;
      y = ((y % height) + height) % height;
      return data[y * width + x] ?? 0;
    case 'clamp':
    default:
      x = Math.max(0, Math.min(width - 1, x));
      y = Math.max(0, Math.min(height - 1, y));
      return data[y * width + x] ?? 0;
  }
}
