/**
 * Comprehensive tests for the core convolution library.
 */

import { describe, it, expect } from 'vitest';
import { createGrid, getPixel, clampByte, type Grid } from '../core/grid';
import { convolve2d } from '../core/convolve2d';
import { convolve1d, type Kernel1D } from '../core/convolve1d';
import { boxBlur, gaussian, laplacian, emboss, sobelX } from '../core/kernels';
import { slopeMap } from '../core/slope';
import { generateTerrain } from '../core/terrain';
import { createRng, nextFloat } from '../core/random';

/* ================================================================== */
/*  1. Terrain uniforme → 0 avec le laplacien                        */
/* ================================================================== */

describe('Laplacian on uniform terrain', () => {
  it('should produce all zeros on a uniform grid', () => {
    const UNIFORM_VALUE = 100;
    const grid = createGrid(5, 5, UNIFORM_VALUE);
    const result = convolve2d(grid, laplacian);

    for (let y = 0; y < result.height; y++) {
      for (let x = 0; x < result.width; x++) {
        expect(result.data[y * result.width + x]).toBe(0);
      }
    }
  });

  it('should produce all zeros for any uniform value (0, 128, 255)', () => {
    for (const value of [0, 128, 255]) {
      const grid = createGrid(7, 7, value);
      const result = convolve2d(grid, laplacian);
      const allZero = result.data.every((v) => v === 0);
      expect(allZero).toBe(true);
    }
  });
});

/* ================================================================== */
/*  2. Somme des coefficients de chaque flou = son diviseur           */
/* ================================================================== */

describe('Blur kernel coefficient sums', () => {
  it('boxBlur coefficients sum to its divisor (9)', () => {
    const sum = boxBlur.values.reduce((a, b) => a + b, 0);
    expect(sum).toBe(boxBlur.divisor);
    expect(sum).toBe(9);
  });

  it('gaussian coefficients sum to its divisor (16)', () => {
    const sum = gaussian.values.reduce((a, b) => a + b, 0);
    expect(sum).toBe(gaussian.divisor);
    expect(sum).toBe(16);
  });
});

/* ================================================================== */
/*  3. Les 3 modes de bord sur un coin et un bord                    */
/* ================================================================== */

describe('Border modes', () => {
  /**
   * 3×3 grid:
   *   10  20  30
   *   40  50  60
   *   70  80  90
   */
  const grid = createGrid(3, 3);
  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  values.forEach((v, i) => {
    (grid.data as number[])[i] = v;
  });

  describe('clamp mode', () => {
    it('should repeat the corner pixel at (-1, -1)', () => {
      expect(getPixel(grid, -1, -1, 'clamp')).toBe(10); // top-left corner
    });

    it('should repeat the edge pixel at (-1, 1)', () => {
      expect(getPixel(grid, -1, 1, 'clamp')).toBe(40); // left edge, row 1
    });

    it('should repeat the bottom-right corner at (3, 3)', () => {
      expect(getPixel(grid, 3, 3, 'clamp')).toBe(90);
    });

    it('should repeat top edge at (1, -1)', () => {
      expect(getPixel(grid, 1, -1, 'clamp')).toBe(20);
    });
  });

  describe('zero mode', () => {
    it('should return 0 at (-1, -1)', () => {
      expect(getPixel(grid, -1, -1, 'zero')).toBe(0);
    });

    it('should return 0 at (3, 1)', () => {
      expect(getPixel(grid, 3, 1, 'zero')).toBe(0);
    });

    it('should return the actual value for in-bounds coordinates', () => {
      expect(getPixel(grid, 1, 1, 'zero')).toBe(50);
    });
  });

  describe('wrap mode', () => {
    it('should wrap (-1, -1) to (2, 2) → 90', () => {
      expect(getPixel(grid, -1, -1, 'wrap')).toBe(90);
    });

    it('should wrap (3, 0) to (0, 0) → 10', () => {
      expect(getPixel(grid, 3, 0, 'wrap')).toBe(10);
    });

    it('should wrap (1, -1) to (1, 2) → 80', () => {
      expect(getPixel(grid, 1, -1, 'wrap')).toBe(80);
    });

    it('should wrap (-1, 1) to (2, 1) → 60', () => {
      expect(getPixel(grid, -1, 1, 'wrap')).toBe(60);
    });
  });
});

/* ================================================================== */
/*  4. Noyau symétrique identique avec/sans retournement ;            */
/*     noyau asymétrique ≠ avec retournement                         */
/* ================================================================== */

describe('Kernel flip behaviour', () => {
  /** A non-uniform 4×4 grid for testing. */
  function makeTestGrid(): Grid {
    const g = createGrid(4, 4);
    const vals = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
    vals.forEach((v, i) => {
      (g.data as number[])[i] = v;
    });
    return g;
  }

  it('symmetric kernel (boxBlur) gives identical results with and without flip', () => {
    const grid = makeTestGrid();
    const noFlip = convolve2d(grid, boxBlur, { flipKernel: false });
    const withFlip = convolve2d(grid, boxBlur, { flipKernel: true });
    expect(noFlip.data).toEqual(withFlip.data);
  });

  it('symmetric kernel (gaussian) gives identical results with and without flip', () => {
    const grid = makeTestGrid();
    const noFlip = convolve2d(grid, gaussian, { flipKernel: false });
    const withFlip = convolve2d(grid, gaussian, { flipKernel: true });
    expect(noFlip.data).toEqual(withFlip.data);
  });

  it('symmetric kernel (laplacian) gives identical results with and without flip', () => {
    const grid = makeTestGrid();
    const noFlip = convolve2d(grid, laplacian, { flipKernel: false });
    const withFlip = convolve2d(grid, laplacian, { flipKernel: true });
    expect(noFlip.data).toEqual(withFlip.data);
  });

  it('asymmetric kernel (sobelX) gives DIFFERENT results with flip', () => {
    const grid = makeTestGrid();
    const noFlip = convolve2d(grid, sobelX, { flipKernel: false });
    const withFlip = convolve2d(grid, sobelX, { flipKernel: true });
    expect(noFlip.data).not.toEqual(withFlip.data);
  });

  it('asymmetric kernel (emboss) gives DIFFERENT results with flip', () => {
    const grid = makeTestGrid();
    const noFlip = convolve2d(grid, emboss, { flipKernel: false });
    const withFlip = convolve2d(grid, emboss, { flipKernel: true });
    expect(noFlip.data).not.toEqual(withFlip.data);
  });
});

/* ================================================================== */
/*  5. Magnitude du gradient vérifiée sur un exemple calculé à la main*/
/* ================================================================== */

describe('Slope map (gradient magnitude) — hand-calculated example', () => {
  it('should match a hand-computed gradient magnitude at the centre pixel', () => {
    /**
     * 3×3 grid:
     *    0   50  100
     *    0   50  100
     *    0   50  100
     *
     * This is a horizontal ramp. At centre (1,1):
     *
     * Sobel X kernel [-1,0,1; -2,0,2; -1,0,1]:
     *   gx = (-1*0 + 0*50 + 1*100) + (-2*0 + 0*50 + 2*100) + (-1*0 + 0*50 + 1*100)
     *      = 100 + 200 + 100 = 400
     *
     * Sobel Y kernel [-1,-2,-1; 0,0,0; 1,2,1]:
     *   gy = (-1*0 + -2*50 + -1*100) + (0 + 0 + 0) + (1*0 + 2*50 + 1*100)
     *      = (-200) + 0 + (200) = 0
     *
     * magnitude = sqrt(400² + 0²) = 400
     * clamped to [0,255] → 255
     */
    const grid = createGrid(3, 3);
    const vals = [0, 50, 100, 0, 50, 100, 0, 50, 100];
    vals.forEach((v, i) => {
      (grid.data as number[])[i] = v;
    });

    const result = slopeMap(grid, 'clamp');
    const centre = result.data[1 * 3 + 1]; // (1,1)
    expect(centre).toBe(255); // 400 clamped to 255
  });

  it('should be 0 on a uniform grid', () => {
    const grid = createGrid(5, 5, 128);
    const result = slopeMap(grid, 'clamp');
    const allZero = result.data.every((v) => v === 0);
    expect(allZero).toBe(true);
  });

  it('should match a hand-computed value on a vertical ramp', () => {
    /**
     * 3×3 grid (vertical ramp):
     *    0    0    0
     *   50   50   50
     *  100  100  100
     *
     * At centre (1,1):
     *   gx = 0 (symmetric horizontally)
     *   gy = (-1*0 + -2*0 + -1*0) + (0) + (1*100 + 2*100 + 1*100) = 400
     *   magnitude = 400 → clamped 255
     */
    const grid = createGrid(3, 3);
    const vals = [0, 0, 0, 50, 50, 50, 100, 100, 100];
    vals.forEach((v, i) => {
      (grid.data as number[])[i] = v;
    });

    const result = slopeMap(grid, 'clamp');
    expect(result.data[1 * 3 + 1]).toBe(255);
  });

  it('should compute a moderate gradient on a diagonal ramp', () => {
    /**
     * 3×3 grid:
     *    0  10  20
     *   10  20  30
     *   20  30  40
     *
     * At centre (1,1):
     *   gx = (-1*0 + 0*10 + 1*20) + (-2*10 + 0*20 + 2*30) + (-1*20 + 0*30 + 1*40)
     *      = 20 + 40 + 20 = 80
     *   gy = (-1*0 + -2*10 + -1*20) + (0) + (1*20 + 2*30 + 1*40)
     *      = (-40) + 0 + (100) = 60  (WAIT — let me recalculate)
     *
     * Actually:
     *   gy = (-1*0 -2*10 -1*20) + (0*10 + 0*20 + 0*30) + (1*20 + 2*30 + 1*40)
     *      = (0 -20 -20) + 0 + (20 + 60 + 40) = -40 + 120 = 80
     *
     *   magnitude = sqrt(80² + 80²) = sqrt(12800) ≈ 113.14 → 113
     */
    const grid = createGrid(3, 3);
    const vals = [0, 10, 20, 10, 20, 30, 20, 30, 40];
    vals.forEach((v, i) => {
      (grid.data as number[])[i] = v;
    });

    const result = slopeMap(grid, 'clamp');
    const centre = result.data[1 * 3 + 1];
    expect(centre).toBe(Math.round(Math.sqrt(80 * 80 + 80 * 80))); // 113
  });
});

/* ================================================================== */
/*  6. Relief identique pour une même graine                          */
/* ================================================================== */

describe('Terrain determinism', () => {
  it('should produce identical grids for the same seed (massif)', () => {
    const a = generateTerrain('massif', 42);
    const b = generateTerrain('massif', 42);
    expect(a.data).toEqual(b.data);
    expect(a.width).toBe(b.width);
    expect(a.height).toBe(b.height);
  });

  it('should produce identical grids for the same seed (plateau)', () => {
    const a = generateTerrain('plateau', 7);
    const b = generateTerrain('plateau', 7);
    expect(a.data).toEqual(b.data);
  });

  it('should produce different grids for different seeds', () => {
    const a = generateTerrain('massif', 1);
    const b = generateTerrain('massif', 2);
    expect(a.data).not.toEqual(b.data);
  });

  it('should produce different grids for different presets', () => {
    const a = generateTerrain('massif', 42);
    const b = generateTerrain('plateau', 42);
    expect(a.data).not.toEqual(b.data);
  });
});

/* ================================================================== */
/*  Extra: PRNG determinism                                           */
/* ================================================================== */

describe('PRNG determinism', () => {
  it('should produce the same sequence from the same seed', () => {
    const rng1 = createRng(123);
    const rng2 = createRng(123);
    const seq1 = Array.from({ length: 20 }, () => nextFloat(rng1));
    const seq2 = Array.from({ length: 20 }, () => nextFloat(rng2));
    expect(seq1).toEqual(seq2);
  });

  it('should produce values in [0, 1)', () => {
    const rng = createRng(999);
    for (let i = 0; i < 1000; i++) {
      const v = nextFloat(rng);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

/* ================================================================== */
/*  Extra: clampByte                                                  */
/* ================================================================== */

describe('clampByte', () => {
  it('should clamp negative values to 0', () => {
    expect(clampByte(-10)).toBe(0);
  });

  it('should clamp values above 255 to 255', () => {
    expect(clampByte(300)).toBe(255);
  });

  it('should round 127.6 to 128', () => {
    expect(clampByte(127.6)).toBe(128);
  });

  it('should leave 0 and 255 unchanged', () => {
    expect(clampByte(0)).toBe(0);
    expect(clampByte(255)).toBe(255);
  });
});

/* ================================================================== */
/*  Extra: 1-D convolution                                            */
/* ================================================================== */

describe('convolve1d', () => {
  it('identity kernel [0, 1, 0] should not change the signal', () => {
    const identity: Kernel1D = { values: [0, 1, 0], divisor: 1, offset: 0 };
    const signal = [10, 50, 100, 200, 255];
    expect(convolve1d(signal, identity)).toEqual(signal);
  });

  it('averaging kernel [1,1,1]/3 should smooth a step edge', () => {
    const avg: Kernel1D = { values: [1, 1, 1], divisor: 3, offset: 0 };
    const signal = [0, 0, 0, 255, 255, 255];
    const result = convolve1d(signal, avg);
    // At index 2: (0+0+255)/3 = 85
    expect(result[2]).toBe(85);
    // At index 3: (0+255+255)/3 = 170
    expect(result[3]).toBe(170);
  });
});
