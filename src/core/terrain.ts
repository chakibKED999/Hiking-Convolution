/**
 * Deterministic terrain generator for educational examples.
 * Uses smoothed seeded noise to create realistic-looking altitude grids.
 *
 * Two presets:
 *   - "massif": several peaks, a valley, and a flat lake.
 *   - "plateau": high flat area with a cliff edge dropping off.
 */

import { createRng, nextFloat } from './random';
import { type Grid, createGrid, clampByte } from './grid';

/** Available terrain presets. */
export type TerrainPreset = 'massif' | 'plateau';

/** Default grid size for generated terrains. */
const DEFAULT_SIZE = 16;

/**
 * Generate a deterministic terrain grid.
 * Same `seed` + same `preset` + same `size` → identical output, always.
 */
export function generateTerrain(
  preset: TerrainPreset,
  seed: number,
  size: number = DEFAULT_SIZE,
): Grid {
  switch (preset) {
    case 'massif':
      return generateMassif(seed, size);
    case 'plateau':
      return generatePlateau(seed, size);
  }
}

/* ------------------------------------------------------------------ */
/*  Massif — multiple peaks, a valley, and a flat lake                */
/* ------------------------------------------------------------------ */

function generateMassif(seed: number, size: number): Grid {
  const grid = createGrid(size, size);
  const rng = createRng(seed);

  /* 1. Base noise at coarse resolution, then bilinear upscale + smooth. */
  const coarseSize = 4;
  const coarse: number[] = [];
  for (let i = 0; i < coarseSize * coarseSize; i++) {
    coarse.push(nextFloat(rng) * 255);
  }

  /* Bilinear interpolation from coarse → full size. */
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * (coarseSize - 1);
      const fy = (y / size) * (coarseSize - 1);
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const dx = fx - ix;
      const dy = fy - iy;

      const ix1 = Math.min(ix + 1, coarseSize - 1);
      const iy1 = Math.min(iy + 1, coarseSize - 1);

      const tl = coarse[iy * coarseSize + ix] ?? 0;
      const tr = coarse[iy * coarseSize + ix1] ?? 0;
      const bl = coarse[iy1 * coarseSize + ix] ?? 0;
      const br = coarse[iy1 * coarseSize + ix1] ?? 0;

      const value =
        tl * (1 - dx) * (1 - dy) + tr * dx * (1 - dy) + bl * (1 - dx) * dy + br * dx * dy;

      grid.data[y * size + x] = clampByte(value);
    }
  }

  /* 2. Add a few deterministic peaks. */
  const peakCount = 2 + Math.floor(nextFloat(rng) * 3); // 2-4 peaks
  for (let p = 0; p < peakCount; p++) {
    const cx = nextFloat(rng) * size;
    const cy = nextFloat(rng) * size;
    const radius = size * (0.15 + nextFloat(rng) * 0.2);
    const peakHeight = 180 + nextFloat(rng) * 75; // 180-255

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < radius) {
          const falloff = 1 - dist / radius;
          const current = grid.data[y * size + x] ?? 0;
          grid.data[y * size + x] = clampByte(current + peakHeight * falloff * falloff);
        }
      }
    }
  }

  /* 3. Carve a valley (low band) and a flat lake (constant region). */
  const valleyY = Math.floor(size * (0.4 + nextFloat(rng) * 0.2));
  const valleyWidth = Math.max(1, Math.floor(size * 0.12));
  for (let y = valleyY; y < Math.min(valleyY + valleyWidth, size); y++) {
    for (let x = 0; x < size; x++) {
      grid.data[y * size + x] = clampByte((grid.data[y * size + x] ?? 0) * 0.2);
    }
  }

  /* Flat lake: a small rectangular region set to a constant low value. */
  const lakeValue = 5 + Math.floor(nextFloat(rng) * 15); // 5-19
  const lakeX = Math.floor(nextFloat(rng) * (size * 0.5));
  const lakeY = Math.floor(nextFloat(rng) * (size * 0.5));
  const lakeW = Math.max(2, Math.floor(size * 0.15));
  const lakeH = Math.max(2, Math.floor(size * 0.15));
  for (let y = lakeY; y < Math.min(lakeY + lakeH, size); y++) {
    for (let x = lakeX; x < Math.min(lakeX + lakeW, size); x++) {
      grid.data[y * size + x] = lakeValue;
    }
  }

  return grid;
}

/* ------------------------------------------------------------------ */
/*  Plateau — high flat area with a cliff edge                        */
/* ------------------------------------------------------------------ */

function generatePlateau(seed: number, size: number): Grid {
  const grid = createGrid(size, size);
  const rng = createRng(seed);

  const plateauHeight = 180 + Math.floor(nextFloat(rng) * 60); // 180-239
  const lowHeight = 10 + Math.floor(nextFloat(rng) * 30); // 10-39
  /** Column where the cliff starts (left side is high, right side is low). */
  const cliffX = Math.floor(size * (0.35 + nextFloat(rng) * 0.3));
  /** Width of the transition zone (cliff slope). */
  const cliffWidth = Math.max(1, Math.floor(size * (0.05 + nextFloat(rng) * 0.1)));

  for (let y = 0; y < size; y++) {
    /* Add slight per-row variation using the PRNG. */
    const rowNoise = (nextFloat(rng) - 0.5) * 10;

    for (let x = 0; x < size; x++) {
      let value: number;
      if (x < cliffX) {
        value = plateauHeight + rowNoise;
      } else if (x < cliffX + cliffWidth) {
        const t = (x - cliffX) / cliffWidth;
        value = plateauHeight * (1 - t) + lowHeight * t + rowNoise;
      } else {
        value = lowHeight + rowNoise;
      }
      grid.data[y * size + x] = clampByte(value);
    }
  }

  return grid;
}
