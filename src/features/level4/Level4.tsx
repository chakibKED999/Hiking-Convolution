import React, { useState, useCallback } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { boxBlur, gaussian } from '@/core/kernels';
import PixelGrid from '@/components/PixelGrid';
import Quiz, { type QuizOption } from '@/components/Quiz';

const TERRAIN_SIZE = 14;
const TERRAIN = generateTerrain('plateau', 12, TERRAIN_SIZE);

const UNIFORM_BLUR_RESULT = convolve2d(TERRAIN, boxBlur);
const GAUSSIAN_BLUR_RESULT = convolve2d(TERRAIN, gaussian);

// Deliberately unnormalized kernel to demonstrate saturation
const UNNORMALIZED_KERNEL = {
  values: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  divisor: 1,
  offset: 0,
};
const SATURATED_RESULT = convolve2d(TERRAIN, UNNORMALIZED_KERNEL);

const REQUIRED_PREDICTIONS = 3;

const QUIZ_QUESTIONS: Array<{
  question: string;
  options: QuizOption[];
}> = [
  {
    question:
      "1. Si un plateau est parfaitement uniforme (altitude 150), quel sera le résultat d'un flou uniforme (somme des poids = 9, diviseur = 9) ?",
    options: [
      {
        label: T.quiz.same,
        value: 'same',
        correct: true,
        explanation:
          "La moyenne de 9 valeurs égales à 150 est exactement (9 × 150) ÷ 9 = 150. L'altitude ne change pas.",
      },
      {
        label: T.quiz.higher,
        value: 'higher',
        correct: false,
        explanation:
          'Faux : faire la moyenne de nombres identiques ne peut pas augmenter leur valeur.',
      },
      {
        label: T.quiz.lower,
        value: 'lower',
        correct: false,
        explanation: 'Faux : la moyenne ne diminue pas non plus une surface uniforme.',
      },
    ],
  },
  {
    question:
      '2. Que se passe-t-il si le cartographe applique les 9 coefficients mais oublie le diviseur (diviseur = 1 au lieu de 9) ?',
    options: [
      {
        label: 'Saturation à 255 (tout blanc)',
        value: 'sat',
        correct: true,
        explanation:
          "La somme 9 × 150 = 1350 dépasse largement 255 : l'écrêtage bloque tout au sommet blanc (255) !",
      },
      {
        label: 'Une image plus nette',
        value: 'sharp',
        correct: false,
        explanation:
          'Non, multiplier les valeurs sans diviser ne crée aucun contraste utile, seulement un éblouissement total.',
      },
      {
        label: 'Aucun changement',
        value: 'none',
        correct: false,
        explanation: 'Sans diviseur, la somme est 9 fois trop grande !',
      },
    ],
  },
  {
    question:
      '3. Pourquoi le noyau gaussien /16 préserve-t-il mieux les détails fins que le flou uniforme /9 ?',
    options: [
      {
        label: 'Le centre pèse 4/16 (25%)',
        value: 'center',
        correct: true,
        explanation:
          "Exact ! Le centre pèse 4 fois plus que les coins, préservant la fidélité du pixel d'origine.",
      },
      {
        label: 'Il contient des nombres négatifs',
        value: 'neg',
        correct: false,
        explanation: 'Faux : les coefficients gaussiens sont tous positifs (1, 2 et 4).',
      },
      {
        label: 'Il calcule 16 pixels à la fois',
        value: 'sixteen',
        correct: false,
        explanation:
          'Non, la fenêtre reste un carré de 3×3 = 9 pixels. 16 est seulement la somme des 9 poids.',
      },
    ],
  },
];

interface Level4Props {
  onComplete: () => void;
}

/**
 * Level 4: "Poids, Flou & Saturation".
 * Compares uniform vs gaussian blur, auto-normalization, and highlights saturation when forgetting to divide.
 * Success: 3 correct answers.
 */
export default function Level4({ onComplete }: Level4Props): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'uniform' | 'gaussian' | 'saturated'>(
    'uniform',
  );
  const [correctCount, setCorrectCount] = useState(0);

  const handleCorrectAnswer = useCallback(() => {
    setCorrectCount((prev) => {
      const next = prev + 1;
      if (next >= REQUIRED_PREDICTIONS) {
        onComplete();
      }
      return next;
    });
  }, [onComplete]);

  const activeResult =
    activeTab === 'uniform'
      ? UNIFORM_BLUR_RESULT
      : activeTab === 'gaussian'
        ? GAUSSIAN_BLUR_RESULT
        : SATURATED_RESULT;

  const levelInfo = T.levels.find((l) => l.id === 3);

  return (
    <div className="space-y-4">
      <div className="tip-banner">
        <p className="text-sm">{levelInfo?.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('uniform')}
          className={`chip text-xs font-bold ${activeTab === 'uniform' ? 'on' : ''}`}
        >
          {T.filters.boxBlur.name}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gaussian')}
          className={`chip text-xs font-bold ${activeTab === 'gaussian' ? 'on' : ''}`}
        >
          {T.filters.gaussian.name}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saturated')}
          className={`chip text-xs font-bold ${activeTab === 'saturated' ? 'on ring-2 ring-[var(--ko)]' : ''}`}
        >
          ⚠️ Sans division (diviseur = 1)
        </button>
      </div>

      {activeTab === 'saturated' && (
        <div className="wk-alert text-xs">
          <h4>Constat d'avalanche de saturation</h4>
          <p>
            Les 9 pixels sont sommés sans diviser par 9. Le résultat dépasse systématiquement 255 et s'écrête en un plateau blanc aveuglant (tempête blizzard) !
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-panel flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Relief brut (Falaise du plateau)
          </span>
          <PixelGrid
            grid={TERRAIN}
            cellSize={20}
            showNumbers={false}
            showGrid={false}
            ariaLabel="Terrain original brut"
          />
        </div>

        <div className="card-panel flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {activeTab === 'uniform' && 'Flou uniforme (/9)'}
            {activeTab === 'gaussian' && 'Flou gaussien (/16)'}
            {activeTab === 'saturated' && 'Saturation pure (÷1)'}
          </span>
          <PixelGrid
            grid={activeResult}
            cellSize={20}
            showNumbers={false}
            showGrid={false}
            ariaLabel="Terrain après application du filtre"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            Questions d'étalonnage ({correctCount} / {REQUIRED_PREDICTIONS} validées)
          </h4>
        </div>
        {QUIZ_QUESTIONS.map((q, idx) => (
          <Quiz
            key={idx}
            question={q.question}
            options={q.options}
            onCorrect={handleCorrectAnswer}
          />
        ))}
      </div>
    </div>
  );
}
