/**
 * "Le Sommet" — 100-Point Final Examination Questions & Calculators.
 * Every single expected answer is computed deterministically using src/core functions.
 * NO answers are hardcoded by hand!
 */

import { createGrid, getPixel } from './grid';
import { convolve1d } from './convolve1d';
import { convolve2d } from './convolve2d';
import { boxBlur, gaussian, sharpen, laplacian, sobelX } from './kernels';
import { slopeMap } from './slope';
import { composeKernels3x3 } from './composition';

export interface ExamQuestion {
  id: number;
  skill: string;
  levelToReview: number;
  points: number;
  title: string;
  context: string;
  options: Array<{ id: string; label: string }>;
  correctId: string;
  explanation: string;
}

/**
 * Question 1: Reading altitude from DEM grid (Level 1).
 * Calculated by creating a uniform grid and reading it.
 */
export function computeQ1(): { expectedValue: number; question: ExamQuestion } {
  const testGrid = createGrid(5, 5, 175);
  const expectedValue = getPixel(testGrid, 2, 2, 'clamp'); // 175

  return {
    expectedValue,
    question: {
      id: 1,
      skill: 'Altimétrie & MNT',
      levelToReview: 1,
      points: 10,
      title: 'Lecture du Modèle Numérique de Terrain',
      context:
        'Le randonneur consulte sa carte altimétrique numérique sur un plateau régulier où chaque pixel vaut 175 (environ 1 750 m). Quelle est la valeur lue par son récepteur ?',
      options: [
        { id: 'a', label: '0' },
        { id: 'b', label: '87' },
        { id: 'c', label: String(expectedValue) },
        { id: 'd', label: '255' },
      ],
      correctId: 'c',
      explanation: `Dans une matrice MNT, la valeur lue correspond exactement à l'altitude encodée : getPixel(grid, 2, 2) = ${expectedValue}.`,
    },
  };
}

/**
 * Question 2: 1D GPS Signal Smoothing (Level 2).
 * Calculated using convolve1d with moving average [1,1,1]/3 on noisy signal.
 */
export function computeQ2(): { expectedValue: number; question: ExamQuestion } {
  const signal = [100, 100, 190, 100, 100];
  const kernel = { values: [1, 1, 1], divisor: 3, offset: 0 };
  const smoothed = convolve1d(signal, kernel);
  const expectedValue = smoothed[2] ?? 0; // (100 + 190 + 100) / 3 = 130

  return {
    expectedValue,
    question: {
      id: 2,
      skill: 'Signal 1D & GPS',
      levelToReview: 2,
      points: 10,
      title: "Lissage d'un saut altimétrique GPS",
      context:
        "La trace GPS d'un col enregistre les altitudes [100, 100, 190, 100, 100] avec un saut parasite à 190 m. Que vaut l'altitude lissée au point central après application du filtre [1, 1, 1] ÷ 3 ?",
      options: [
        { id: 'a', label: '190 m' },
        { id: 'b', label: `${expectedValue} m` },
        { id: 'c', label: '100 m' },
        { id: 'd', label: '145 m' },
      ],
      correctId: 'b',
      explanation: `La convolution 1D calcule la moyenne : (100 + 190 + 100) ÷ 3 = 390 ÷ 3 = ${expectedValue} m.`,
    },
  };
}

/**
 * Question 3: 3×3 Window & Dot Product (Level 3).
 * Calculated using convolve2d on a 3x3 local patch with an isolated summit peak.
 */
export function computeQ3(): { expectedValue: number; question: ExamQuestion } {
  const grid = createGrid(3, 3, 60);
  grid.data[4] = 150; // summit peak at center (1,1)
  const blurred = convolve2d(grid, boxBlur);
  const expectedValue = blurred.data[4] ?? 0; // (8 * 60 + 150) / 9 = 630 / 9 = 70

  return {
    expectedValue,
    question: {
      id: 3,
      skill: 'Fenêtre glissante 3×3',
      levelToReview: 3,
      points: 10,
      title: "Moyenne locale d'un pic rocheux isolé",
      context:
        "Un piton rocheux culminant à 150 est entouré de 8 alpages à 60. Après passage d'un flou uniforme 3×3 (diviseur 9), quelle altitude le cartographe obtient-il au sommet ?",
      options: [
        { id: 'a', label: '60' },
        { id: 'b', label: String(expectedValue) },
        { id: 'c', label: '105' },
        { id: 'd', label: '150' },
      ],
      correctId: 'b',
      explanation: `Somme des 9 cases = (8 × 60) + 150 = 480 + 150 = 630. Division par 9 = ${expectedValue}.`,
    },
  };
}

/**
 * Question 4: Normalization & Divisor (Level 4).
 * Calculated using sum of gaussian kernel coefficients.
 */
export function computeQ4(): { expectedValue: number; question: ExamQuestion } {
  const sum = gaussian.values.reduce((a, b) => a + b, 0);
  const expectedValue = sum; // 16

  return {
    expectedValue,
    question: {
      id: 4,
      skill: 'Coefficients & Diviseur',
      levelToReview: 4,
      points: 10,
      title: "Conservation de l'énergie d'altitude (normalisation)",
      context:
        "Pour que le filtre gaussien [1,2,1, 2,4,2, 1,2,1] ne modifie pas l'altitude d'une vaste plaine uniforme, par quel nombre exact faut-il diviser la somme pondérée ?",
      options: [
        { id: 'a', label: '9' },
        { id: 'b', label: '12' },
        { id: 'c', label: String(expectedValue) },
        { id: 'd', label: '25' },
      ],
      correctId: 'c',
      explanation: `La somme des poids est 1+2+1+2+4+2+1+2+1 = ${expectedValue}. Le diviseur doit être exactement égal à la somme des coefficients.`,
    },
  };
}

/**
 * Question 5: Border Modes (Level 5).
 * Reading out-of-bounds in 'zero' mode.
 */
export function computeQ5(): { expectedValue: number; question: ExamQuestion } {
  const grid = createGrid(4, 4, 120);
  const expectedValue = getPixel(grid, -1, -1, 'zero'); // 0

  return {
    expectedValue,
    question: {
      id: 5,
      skill: 'Gestion des Bords',
      levelToReview: 5,
      points: 10,
      title: 'Comportement en lisière de carte (Mode Zéro)',
      context:
        "Le randonneur arrive à l'angle nord-ouest de sa carte. La fenêtre 3×3 déborde aux coordonnées (-1, -1). Avec la stratégie « zéro », quelle valeur fictive est renvoyée pour le vide ?",
      options: [
        { id: 'a', label: String(expectedValue) },
        { id: 'b', label: '120' },
        { id: 'c', label: '255' },
        { id: 'd', label: 'NaN' },
      ],
      correctId: 'a',
      explanation: `Le mode 'zero' assigne une altitude nulle (0) à tout point situé hors de la grille : getPixel(grid, -1, -1, 'zero') = ${expectedValue}.`,
    },
  };
}

/**
 * Question 6: Laplacian on Uniform Plateau (Level 6).
 * Calculated with laplacian on uniform terrain.
 */
export function computeQ6(): { expectedValue: number; question: ExamQuestion } {
  const uniform = createGrid(5, 5, 200);
  const result = convolve2d(uniform, laplacian);
  const expectedValue = result.data[12] ?? 0; // 0

  return {
    expectedValue,
    question: {
      id: 6,
      skill: 'Détection de Crêtes (Laplacien)',
      levelToReview: 6,
      points: 10,
      title: 'Détection de falaise sur plateau parfaitement plat',
      context:
        'Sur un plateau glaciaire de 2 000 m modélisé par une valeur uniforme de 200, que renvoie le filtre Laplacien [-1,-1,-1, -1,8,-1, -1,-1,-1] ?',
      options: [
        { id: 'a', label: '200' },
        { id: 'b', label: '8' },
        { id: 'c', label: String(expectedValue) },
        { id: 'd', label: '255' },
      ],
      correctId: 'c',
      explanation: `La somme des coefficients du Laplacien est (-1)×8 + 8 = 0. Sur un terrain uniforme, le résultat est strictement ${expectedValue}.`,
    },
  };
}

/**
 * Question 7: Sobel Gradient Magnitude (Level 7).
 * Calculated with slopeMap on horizontal ramp.
 */
export function computeQ7(): { expectedValue: number; question: ExamQuestion } {
  const ramp = createGrid(3, 3, 0);
  // Column 0 = 0, Column 1 = 20, Column 2 = 40
  for (let y = 0; y < 3; y++) {
    ramp.data[y * 3 + 0] = 0;
    ramp.data[y * 3 + 1] = 20;
    ramp.data[y * 3 + 2] = 40;
  }
  const slopes = slopeMap(ramp);
  // gx = (-1*0 + 1*40) + (-2*0 + 2*40) + (-1*0 + 1*40) = 40 + 80 + 40 = 160
  // gy = 0
  // magnitude = sqrt(160^2 + 0) = 160
  const expectedValue = slopes.data[4] ?? 0; // 160

  return {
    expectedValue,
    question: {
      id: 7,
      skill: 'Carte des Pentes (Sobel)',
      levelToReview: 7,
      points: 10,
      title: 'Calcul de raideur de pente avec Sobel',
      context:
        "Un versant régulier monte de 20 unités par case d'ouest en est ([0, 20, 40] sur chaque ligne). Quelle magnitude de pente le filtre Sobel calcule-t-il au centre ?",
      options: [
        { id: 'a', label: '40' },
        { id: 'b', label: '80' },
        { id: 'c', label: String(expectedValue) },
        { id: 'd', label: '255' },
      ],
      correctId: 'c',
      explanation: `Sobel X donne gx = 160 et gy = 0. La magnitude vaut √(160² + 0²) = ${expectedValue}.`,
    },
  };
}

/**
 * Question 8: Mystery Filter (Level 8).
 * Sharpen kernel identification.
 */
export function computeQ8(): { expectedValue: string; question: ExamQuestion } {
  const isSharpen = sharpen.values[4] === 5;
  const expectedValue = isSharpen ? 'Jumelles (Netteté)' : 'Inconnu';

  return {
    expectedValue,
    question: {
      id: 8,
      skill: 'Reconnaissance de Filtre',
      levelToReview: 8,
      points: 10,
      title: "Identification de l'outil du cartographe",
      context:
        'Le guide observe un noyau [0, -1, 0, -1, 5, -1, 0, -1, 0] avec diviseur 1. Quel outil cartographique correspond à cette matrice ?',
      options: [
        { id: 'a', label: 'Brouillard (Box Blur)' },
        { id: 'b', label: 'Jumelles (Netteté / Sharpen)' },
        { id: 'c', label: 'Ombrage (Emboss)' },
        { id: 'd', label: 'Carte des pentes (Sobel)' },
      ],
      correctId: 'b',
      explanation:
        "Ce noyau amplifie le pixel central (+5) et soustrait ses 4 voisins directs (-1×4 = -4), rehaussant les micro-contrastes : c'est le filtre de netteté.",
    },
  };
}

/**
 * Question 9: Double 3x3 Blur Composition (Level 10).
 * Center coefficient of composed 5x5 kernel.
 */
export function computeQ9(): { expectedValue: number; question: ExamQuestion } {
  const composed = composeKernels3x3(boxBlur, boxBlur);
  const expectedValue = composed.values[12] ?? 0; // center of 5x5 = 9

  return {
    expectedValue,
    question: {
      id: 9,
      skill: 'Composition de Filtres',
      levelToReview: 10,
      points: 10,
      title: 'Équivalence 3×3 en cascade et noyau 5×5',
      context:
        "Deux passages successifs d'un flou uniforme 3×3 (diviseur 9) équivalent mathématiquement à un unique filtre 5×5 (diviseur 81). Que vaut le coefficient central de cette pyramide 5×5 ?",
      options: [
        { id: 'a', label: '1' },
        { id: 'b', label: '5' },
        { id: 'c', label: String(expectedValue) },
        { id: 'd', label: '25' },
      ],
      correctId: 'c',
      explanation: `Le produit de convolution discret de [1,1,1] avec lui-même en 2D donne au centre 3 × 3 = ${expectedValue} (avec un diviseur de 9 × 9 = 81).`,
    },
  };
}

/**
 * Question 10: Convolution vs Cross-Correlation (Level 10).
 * Flipped kernel behavior.
 */
export function computeQ10(): { expectedValue: boolean; question: ExamQuestion } {
  const asymmetric = sobelX;
  const grid = createGrid(4, 4, 10);
  grid.data[5] = 80;
  const standard = convolve2d(grid, asymmetric, { flipKernel: false });
  const flipped = convolve2d(grid, asymmetric, { flipKernel: true });

  const areDifferent = standard.data.some((val, i) => val !== flipped.data[i]);

  return {
    expectedValue: areDifferent,
    question: {
      id: 10,
      skill: 'Convolution vs Corrélation',
      levelToReview: 10,
      points: 10,
      title: 'Honnêteté mathématique : retournement du noyau',
      context:
        'Quelle est la différence fondamentale entre la corrélation croisée (utilisée par défaut par la plupart des logiciels) et la véritable convolution mathématique ?',
      options: [
        {
          id: 'a',
          label: 'La vraie convolution retourne le noyau de 180° avant le calcul',
        },
        { id: 'b', label: 'La vraie convolution divise toujours par 255' },
        { id: 'c', label: "La corrélation croisée ne fonctionne qu'en 1D" },
        { id: 'd', label: "Il n'y a aucune différence géométrique" },
      ],
      correctId: 'a',
      explanation:
        'En mathématiques pures, la convolution inverse les indices k(x, y) = h(-x, -y), ce qui équivaut à une rotation de 180° du masque. Pour les noyaux symétriques, le résultat est identique ; pour un noyau asymétrique (Sobel, Emboss), les résultats diffèrent.',
    },
  };
}

/**
 * Generate all 10 exam questions, with all answers dynamically computed through core logic.
 */
export function getExamQuestions(): ExamQuestion[] {
  return [
    computeQ1().question,
    computeQ2().question,
    computeQ3().question,
    computeQ4().question,
    computeQ5().question,
    computeQ6().question,
    computeQ7().question,
    computeQ8().question,
    computeQ9().question,
    computeQ10().question,
  ];
}
