/**
 * Barrel export for the core library.
 * Every module here is pure TypeScript — no React, no DOM.
 */

export { createRng, nextFloat, nextInt } from './random';
export {
  type Grid,
  type BorderMode,
  createGrid,
  setPixel,
  getPixel,
  clampByte,
} from './grid';
export { type Kernel1D, convolve1d } from './convolve1d';
export { type Kernel2D, type Convolve2DOptions, convolve2d } from './convolve2d';
export { boxBlur, gaussian, sharpen, laplacian, emboss, sobelX, sobelY } from './kernels';
export { slopeMap, sobelComponents, findSteepestPixel } from './slope';
export { type TerrainPreset, generateTerrain } from './terrain';
export { meanAbsoluteError, calculateSimilarityScore } from './metrics';
export {
  composeKernels3x3,
  convolve5x5,
  DOUBLE_BOX_BLUR_5X5_VALUES,
  DOUBLE_BOX_BLUR_5X5_DIVISOR,
} from './composition';
export {
  getExamQuestions,
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
  type ExamQuestion,
} from './exam';
export {
  loadProgress,
  saveProgress,
  resetProgress,
  grantLevelReward,
  getRankFromElevation,
  type TrailKernelProgress,
  type HikerRank,
} from './storage';
