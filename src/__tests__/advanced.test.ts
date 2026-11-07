/**
 * Advanced core tests covering:
 * - Metrics (MAE, scoring)
 * - Kernel composition (3×3 cascade vs 5×5 equivalent)
 * - Sobel components & steepest pixel detection
 * - Exam 100-point question verification (all answers mathematically calculated)
 * - Gamification & progress rank calculations
 */

import { describe, it, expect } from 'vitest';
import {
  createGrid,
  boxBlur,
  convolve2d,
  meanAbsoluteError,
  calculateSimilarityScore,
  composeKernels3x3,
  convolve5x5,
  DOUBLE_BOX_BLUR_5X5_VALUES,
  DOUBLE_BOX_BLUR_5X5_DIVISOR,
  sobelComponents,
  slopeMap,
  findSteepestPixel,
  getRankFromElevation,
  computeQ1,
  computeQ2,
  computeQ3,
  computeQ4,
  computeQ5,
  computeQ6,
  computeQ7,
  computeQ8,
  computeQ9,
  computeQ10,
  getExamQuestions,
} from '../core';

describe('Metrics & Similarity', () => {
  it('MAE is 0 for identical grids', () => {
    const a = createGrid(4, 4, 120);
    const b = createGrid(4, 4, 120);
    expect(meanAbsoluteError(a, b)).toBe(0);
    expect(calculateSimilarityScore(a, b)).toBe(100);
  });

  it('MAE correctly reflects mean absolute difference', () => {
    const a = createGrid(2, 2, 50);
    const b = createGrid(2, 2, 70);
    expect(meanAbsoluteError(a, b)).toBe(20);
  });
});

describe('Kernel Composition (3×3 double blur vs 5×5)', () => {
  it('Composing two 3×3 box blurs produces a 5×5 kernel of sum 81 and center 9', () => {
    const composed = composeKernels3x3(boxBlur, boxBlur);
    expect(composed.values.length).toBe(25);
    expect(composed.divisor).toBe(81);

    const sum = composed.values.reduce((acc, v) => acc + v, 0);
    expect(sum).toBe(81);
    expect(composed.values[12]).toBe(9); // center
    expect(composed.values[0]).toBe(1); // top-left
    expect(composed.values[24]).toBe(1); // bottom-right
  });

  it('Applying 3×3 box blur twice matches single 5×5 convolution on interior pixels', () => {
    // 7×7 grid with a centered feature
    const grid = createGrid(7, 7, 50);
    grid.data[3 * 7 + 3] = 200; // center spike

    // Double 3×3 application
    const pass1 = convolve2d(grid, boxBlur, { borderMode: 'clamp' });
    const pass2 = convolve2d(pass1, boxBlur, { borderMode: 'clamp' });

    // Single 5×5 application
    const direct5x5 = convolve5x5(
      grid,
      DOUBLE_BOX_BLUR_5X5_VALUES,
      DOUBLE_BOX_BLUR_5X5_DIVISOR,
      0,
      'clamp',
    );

    // Center pixel (x: 3, y: 3) is well away from borders
    const centerDouble = pass2.data[3 * 7 + 3] ?? 0;
    const center5x5 = direct5x5.data[3 * 7 + 3] ?? 0;

    // Small rounding difference at most 1 unit due to intermediate integer clamping
    expect(Math.abs(centerDouble - center5x5)).toBeLessThanOrEqual(1);
  });
});

describe('Sobel components & steepest pixel', () => {
  it('sobelComponents magnitude matches slopeMap output', () => {
    const grid = createGrid(5, 5, 100);
    grid.data[12] = 220; // spike in center

    const { magnitude } = sobelComponents(grid, 'clamp');
    const directSlope = slopeMap(grid, 'clamp');

    expect(magnitude.data).toEqual(directSlope.data);
  });

  it('findSteepestPixel accurately identifies the sharpest edge', () => {
    const grid = createGrid(5, 5, 0);
    // Vertical cliff at column 3
    for (let y = 0; y < 5; y++) {
      grid.data[y * 5 + 3] = 250;
    }

    const slopes = slopeMap(grid, 'clamp');
    const steepest = findSteepestPixel(slopes);

    expect(steepest.maxSlope).toBeGreaterThan(150);
    expect(steepest.x).toBeGreaterThanOrEqual(2);
    expect(steepest.x).toBeLessThanOrEqual(4);
  });
});

describe('Gamification: Elevation & Ranks', () => {
  it('correctly maps D+ meters to hiker ranks', () => {
    expect(getRankFromElevation(0).rank).toBe('Marcheur');
    expect(getRankFromElevation(299).rank).toBe('Marcheur');
    expect(getRankFromElevation(300).rank).toBe('Randonneur');
    expect(getRankFromElevation(699).rank).toBe('Randonneur');
    expect(getRankFromElevation(700).rank).toBe('Alpiniste');
    expect(getRankFromElevation(1199).rank).toBe('Alpiniste');
    expect(getRankFromElevation(1200).rank).toBe('Guide de haute montagne');
    expect(getRankFromElevation(2500).rank).toBe('Guide de haute montagne');
  });
});

describe('Final Exam ("Le Sommet"): Core-calculated questions', () => {
  it('Q1 returns DEM grid read value 175', () => {
    const q1 = computeQ1();
    expect(q1.expectedValue).toBe(175);
    expect(q1.question.correctId).toBe('c');
  });

  it('Q2 returns 1D smoothed value 130', () => {
    const q2 = computeQ2();
    expect(q2.expectedValue).toBe(130);
    expect(q2.question.correctId).toBe('b');
  });

  it('Q3 returns 3x3 box blur on isolated peak = 70', () => {
    const q3 = computeQ3();
    expect(q3.expectedValue).toBe(70);
    expect(q3.question.correctId).toBe('b');
  });

  it('Q4 returns gaussian coefficient sum = 16', () => {
    const q4 = computeQ4();
    expect(q4.expectedValue).toBe(16);
    expect(q4.question.correctId).toBe('c');
  });

  it('Q5 returns out-of-bounds zero value = 0', () => {
    const q5 = computeQ5();
    expect(q5.expectedValue).toBe(0);
    expect(q5.question.correctId).toBe('a');
  });

  it('Q6 returns laplacian on uniform plateau = 0', () => {
    const q6 = computeQ6();
    expect(q6.expectedValue).toBe(0);
    expect(q6.question.correctId).toBe('c');
  });

  it('Q7 returns sobel magnitude on ramp = 160', () => {
    const q7 = computeQ7();
    expect(q7.expectedValue).toBe(160);
    expect(q7.question.correctId).toBe('c');
  });

  it('Q8 accurately identifies sharpen kernel', () => {
    const q8 = computeQ8();
    expect(q8.expectedValue).toBe('Jumelles (Netteté)');
    expect(q8.question.correctId).toBe('b');
  });

  it('Q9 returns composed 5x5 center = 9', () => {
    const q9 = computeQ9();
    expect(q9.expectedValue).toBe(9);
    expect(q9.question.correctId).toBe('c');
  });

  it('Q10 confirms asymmetric Sobel changes when flipped', () => {
    const q10 = computeQ10();
    expect(q10.expectedValue).toBe(true);
    expect(q10.question.correctId).toBe('a');
  });

  it('All 10 questions are properly populated and total 100 points', () => {
    const questions = getExamQuestions();
    expect(questions.length).toBe(10);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    expect(totalPoints).toBe(100);
  });
});
