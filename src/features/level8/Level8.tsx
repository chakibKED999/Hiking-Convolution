import React, { useState, useMemo } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { boxBlur, sharpen, laplacian, emboss } from '@/core/kernels';
import PixelGrid from '@/components/PixelGrid';
import HikerMascot from '@/components/HikerMascot';

const REQUIRED_CORRECT = 2;

interface RoundDefinition {
  title: string;
  kernelKey: 'boxBlur' | 'sharpen' | 'laplacian' | 'emboss';
  explanation: string;
  options: Array<{ id: string; label: string }>;
}

const ROUNDS: RoundDefinition[] = [
  {
    title: 'Manche 1 : Observez cette carte adoucie',
    kernelKey: 'boxBlur',
    explanation:
      "Les ruptures de pente et les arêtes vives sont gommées, comme si un épais brouillard s'était abattu sur le massif : c'est le flou uniforme (Box Blur).",
    options: [
      { id: 'boxBlur', label: '🌫️ Brouillard (Box Blur /9)' },
      { id: 'sharpen', label: '🔭 Jumelles (Netteté / Sharpen)' },
      { id: 'laplacian', label: '🏔️ Crêtes & falaises (Laplacien)' },
      { id: 'emboss', label: '🌄 Ombrage du relief (Emboss)' },
    ],
  },
  {
    title: 'Manche 2 : Observez ce tracé blanc sur fond sombre',
    kernelKey: 'laplacian',
    explanation:
      "Les zones plates et uniformes sont noires (valeur 0), tandis que les crêtes rocheuses et rebords de falaise s'illuminent en blanc : c'est le filtre de détection de contours (Laplacien).",
    options: [
      { id: 'boxBlur', label: '🌫️ Brouillard (Box Blur /9)' },
      { id: 'sharpen', label: '🔭 Jumelles (Netteté / Sharpen)' },
      { id: 'laplacian', label: '🏔️ Crêtes & falaises (Laplacien)' },
      { id: 'emboss', label: '🌄 Ombrage du relief (Emboss)' },
    ],
  },
  {
    title: 'Manche 3 : Observez cet effet de lumière en relief 3D',
    kernelKey: 'emboss',
    explanation:
      "Le relief semble éclairé par un soleil couchant rasant, avec des versants éclairés en blanc et des versants opposés plongés dans l'ombre, le tout centré sur le gris 128 : c'est l'embossage (Emboss).",
    options: [
      { id: 'boxBlur', label: '🌫️ Brouillard (Box Blur /9)' },
      { id: 'sharpen', label: '🔭 Jumelles (Netteté / Sharpen)' },
      { id: 'laplacian', label: '🏔️ Crêtes & falaises (Laplacien)' },
      { id: 'emboss', label: '🌄 Ombrage du relief (Emboss)' },
    ],
  },
];

interface Level8Props {
  onComplete: () => void;
}

/**
 * Level 8: "Quelle carte est-ce ?".
 * Mystery blind test guessing which convolution filter generated the displayed map.
 * Condition: 2 correct answers.
 */
export default function Level8({ onComplete }: Level8Props): React.JSX.Element {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const terrain = useMemo(() => {
    return generateTerrain('massif', 66, 12);
  }, []);

  const activeRound = ROUNDS[currentRoundIdx] ?? ROUNDS[0];
  if (!activeRound) return <div />;

  const mysteryKernel =
    activeRound.kernelKey === 'boxBlur'
      ? boxBlur
      : activeRound.kernelKey === 'sharpen'
        ? sharpen
        : activeRound.kernelKey === 'laplacian'
          ? laplacian
          : emboss;

  const mysteryMap = useMemo(() => {
    return convolve2d(terrain, mysteryKernel, { borderMode: 'clamp' });
  }, [terrain, mysteryKernel]);

  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === activeRound.kernelKey;

  const handleSelectOption = (optId: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(optId);

    if (optId === activeRound.kernelKey) {
      const nextCount = correctCount + 1;
      setCorrectCount(nextCount);
      if (nextCount >= REQUIRED_CORRECT) {
        onComplete();
      }
    }
  };

  const handleNextRound = () => {
    setSelectedAnswer(null);
    setCurrentRoundIdx((prev) => (prev + 1) % ROUNDS.length);
  };

  const levelInfo = T.levels.find((l) => l.id === 4) ?? T.levels[0];

  return (
    <div className="space-y-5">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <HikerMascot
        message="« Examinez la texture de la roche ! Y a-t-il un adoucissement, un éclairage directionnel ou des crêtes surlignées ? Faites confiance à vos yeux de montagnard. »"
        size="sm"
      />

      <div className="flex flex-col items-center gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between w-full max-w-md">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {activeRound.title}
          </span>
          <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
            Score : {correctCount} / {REQUIRED_CORRECT}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
          <PixelGrid
            grid={mysteryMap}
            cellSize={24}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Carte mystère à identifier"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
          {activeRound.options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            let btnClasses =
              'p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer';

            if (!hasAnswered) {
              btnClasses +=
                ' bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-orange-500';
            } else if (isSelected) {
              btnClasses += isCorrect
                ? ' bg-green-600 border-green-700 text-white'
                : ' bg-red-600 border-red-700 text-white';
            } else if (opt.id === activeRound.kernelKey) {
              btnClasses +=
                ' bg-green-100 border-green-400 text-green-900 font-extrabold';
            } else {
              btnClasses +=
                ' bg-stone-50 border-stone-200 text-stone-400 opacity-50 cursor-default';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelectOption(opt.id)}
                className={btnClasses}
              >
                <span>{opt.label}</span>
                {hasAnswered && opt.id === activeRound.kernelKey && <span>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback explanation */}
        {hasAnswered && (
          <div
            className={`w-full max-w-md p-3.5 rounded-xl border text-xs leading-relaxed space-y-2 ${
              isCorrect
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>{isCorrect ? '🎉 Bonne pioche !' : '❌ Pas tout à fait...'}</span>
            </div>
            <p>{activeRound.explanation}</p>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleNextRound}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white transition-colors cursor-pointer"
              >
                Manche suivante →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
