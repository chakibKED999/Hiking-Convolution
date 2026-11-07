/**
 * 2-D grid of pixel values (0-255 integers) and boundary-access helpers.
 */

/** Supported border modes when reading outside the grid. */
export type BorderMode = 'clamp' | 'zero' | 'wrap';

/** A 2-D grid stored as a flat array in row-major order. */
export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly data: number[];
}

/** Create a new grid filled with a constant value (default 0). */
export function createGrid(width: number, height: number, fill: number = 0): Grid {
  return { width, height, data: new Array<number>(width * height).fill(fill) };
}

/** Set a pixel value at (x, y). No bounds-checking — caller must ensure validity. */
export function setPixel(grid: Grid, x: number, y: number, value: number): void {
  grid.data[y * grid.width + x] = value;
}

/**
 * Read a pixel with the chosen border mode for out-of-bounds coordinates.
 * - `clamp`: repeat the nearest edge pixel.
 * - `zero`:  return 0 for out-of-bounds.
 * - `wrap`:  wrap around (torus topology).
 */
export function getPixel(
  grid: Grid,
  x: number,
  y: number,
  mode: BorderMode = 'clamp',
): number {
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

/** Clamp a floating-point value to [0, 255] and round to the nearest integer. */
export function clampByte(value: number): number {
  return Math.round(Math.max(0, Math.min(255, value)));
}
