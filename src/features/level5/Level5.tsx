import React, { useState, useCallback } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { laplacian } from '@/core/kernels';
import type { BorderMode } from '@/core/grid';
import PixelGrid from '@/components/PixelGrid';
import Quiz, { type QuizOption } from '@/components/Quiz';

const GRID_SIZE = 10;
const SEED = 55;
const TERRAIN = generateTerrain('massif', SEED, GRID_SIZE);

const REQUIRED_ANSWERS = 2;

const BORDER_MODES: readonly BorderMode[] = ['clamp', 'zero', 'wrap'];

const QUIZ_BORDER: Array<{
  question: string;
  options: QuizOption[];
}> = [
  {
    question:
      '1. Quel mode de bord produit un cadre sombre (altitude 0) tout autour de la carte ?',
    options: [
      {
        label: "Zéro (fond d'abîme)",
        value: 'zero',
        correct: true,
        explanation:
          'En supposant 0 au-delà des lisières, la différence avec le terrain intérieur crée un cadre artificiel sombre.',
      },
      {
        label: 'Répéter (clamp)',
        value: 'clamp',
        correct: false,
        explanation:
          "Non, clamp prolonge la valeur de lisière et préserve au mieux l'allure naturelle du bord.",
      },
      {
        label: 'Boucler (wrap)',
        value: 'wrap',
        correct: false,
        explanation: 'Non, wrap raccorde les bords opposés entre eux.',
      },
    ],
  },
  {
    question:
      '2. Si votre monde est un tore sans fin ou une texture continue qui se répète (ex: tuilage de carte), quel mode convient ?',
    options: [
      {
        label: 'Boucler (wrap)',
        value: 'wrap',
        correct: true,
        explanation:
          'Exact ! Wrap raccorde le bord droit au bord gauche, créant un continuum périodique parfait.',
      },
      {
        label: 'Répéter (clamp)',
        value: 'clamp',
        correct: false,
        explanation: 'Clamp fige la lisière sans raccord avec le versant opposé.',
      },
      {
        label: 'Zéro (zero)',
        value: 'zero',
        correct: false,
        explanation: 'Zero casse la continuité en créant une faille de niveau 0.',
      },
    ],
  },
];

interface Level5Props {
  onComplete: () => void;
}

/**
 * Level 5: "Les bords de la carte".
 * Side-by-side comparison of edge boundary modes (clamp, zero, wrap).
 * Success: 2 correct quiz answers.
 */
export default function Level5({ onComplete }: Level5Props): React.JSX.Element {
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const results = {
    clamp: convolve2d(TERRAIN, laplacian, { borderMode: 'clamp' }),
    zero: convolve2d(TERRAIN, laplacian, { borderMode: 'zero' }),
    wrap: convolve2d(TERRAIN, laplacian, { borderMode: 'wrap' }),
  };

  const handleCorrect = useCallback(() => {
    setCorrectAnswers((prev) => {
      const next = prev + 1;
      if (next >= REQUIRED_ANSWERS) {
        onComplete();
      }
      return next;
    });
  }, [onComplete]);

  const levelInfo = T.levels.find((l) => l.id === 5) ?? T.levels[0];

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BORDER_MODES.map((mode) => {
          const modeInfo = T.borderModes[mode];
          return (
            <div
              key={mode}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs"
            >
              <h4 className="text-xs font-bold text-stone-800 text-center">
                {modeInfo.name}
              </h4>
              <p className="text-[11px] text-stone-500 text-center min-h-[32px]">
                {modeInfo.description}
              </p>
              <PixelGrid
                grid={results[mode]}
                cellSize={24}
                showNumbers={false}
                showGrid={true}
                ariaLabel={`Résultat bord ${mode}`}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Vérification cartographique ({correctAnswers} / {REQUIRED_ANSWERS})
        </h4>
        {QUIZ_BORDER.map((q, i) => (
          <Quiz
            key={i}
            question={q.question}
            options={q.options}
            onCorrect={handleCorrect}
          />
        ))}
      </div>
    </div>
  );
}
