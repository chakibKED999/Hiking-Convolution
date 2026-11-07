import React, { useState, useMemo, useEffect } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d, type Kernel2D } from '@/core/convolve2d';
import { laplacian } from '@/core/kernels';
import { meanAbsoluteError, calculateSimilarityScore } from '@/core/metrics';
import PixelGrid from '@/components/PixelGrid';
import KernelEditor from '@/components/KernelEditor';
import HikerMascot from '@/components/HikerMascot';

const GRID_SIZE = 12;
const SEED = 28;
const TERRAIN = generateTerrain('plateau', SEED, GRID_SIZE);

// The ideal target map is the true ridge line detection
const TARGET_KERNEL: Kernel2D = laplacian;
const TARGET_MAP = convolve2d(TERRAIN, TARGET_KERNEL, { borderMode: 'clamp' });

const INITIAL_PLAYER_KERNEL: Kernel2D = {
  values: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  divisor: 1,
  offset: 0,
};

const SUCCESS_SCORE_THRESHOLD = 80;

const HINTS = [
  'Indice 1 : Pour isoler une ligne de crête, le filtre doit annuler les zones plates en soustrayant les voisins du point central.',
  "Indice 2 : La somme totale des 9 coefficients doit s'approcher de 0 pour que les plateaux et vallées deviennent parfaitement noirs (0).",
  'Indice 3 : Testez un centre fort (+8 ou +4) entouré de voisins négatifs (-1), avec un diviseur égal à 1.',
];

interface Level9Props {
  onComplete: () => void;
}

/**
 * Level 9: "Le défi du guide".
 * The player designs a 3×3 convolution kernel to isolate the ridge line of the plateau.
 * Automatically scored by comparing with the ideal target map using Mean Absolute Error.
 * Progressive hints available.
 */
export default function Level9({ onComplete }: Level9Props): React.JSX.Element {
  const [playerKernel, setPlayerKernel] = useState<Kernel2D>(INITIAL_PLAYER_KERNEL);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  // Compute player output via core
  const playerMap = useMemo(() => {
    return convolve2d(TERRAIN, playerKernel, { borderMode: 'clamp' });
  }, [playerKernel]);

  // Compute MAE and similarity score via core
  const mae = useMemo(() => {
    return meanAbsoluteError(playerMap, TARGET_MAP);
  }, [playerMap]);

  const score = useMemo(() => {
    return calculateSimilarityScore(playerMap, TARGET_MAP, 50);
  }, [playerMap]);

  const isSuccess = score >= SUCCESS_SCORE_THRESHOLD;

  useEffect(() => {
    if (isSuccess) {
      onComplete();
    }
  }, [isSuccess, onComplete]);

  const handleRevealNextHint = () => {
    setRevealedHints((prev) => Math.min(prev + 1, HINTS.length));
  };

  const levelInfo = T.levels.find((l) => l.id === 5) ?? T.levels[0];

  return (
    <div className="space-y-5">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <HikerMascot
        message="« Objectif du jour : faire briller la ligne de falaise tout en plongeant le haut et le bas du plateau dans le noir ! Ajustez les poids et observez votre jauge de ressemblance. »"
        size="sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Source Terrain */}
        <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            1. Relief d'origine
          </span>
          <PixelGrid
            grid={TERRAIN}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Relief brut du plateau"
          />
          <span className="text-[11px] text-stone-400">
            Plateau avec falaise centrale
          </span>
        </div>

        {/* Player Map */}
        <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            2. Votre carte forgée
          </span>
          <PixelGrid
            grid={playerMap}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Résultat produit par votre noyau"
          />
          <div className="w-full bg-stone-50 p-2 rounded-lg border border-stone-200 text-center font-mono text-xs">
            Score :{' '}
            <strong className={isSuccess ? 'text-green-700' : 'text-orange-700'}>
              {score} %
            </strong>{' '}
            (Écart moyen : {mae.toFixed(1)})
          </div>
        </div>

        {/* Target Ideal Map */}
        <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
            3. Carte cible du guide
          </span>
          <PixelGrid
            grid={TARGET_MAP}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Ligne de crête idéale ciblée"
          />
          <span className="text-[11px] text-green-700 font-semibold">
            Crête isolée (Objectif 80%+)
          </span>
        </div>
      </div>

      {/* Kernel Workshop & Scoring Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 text-center">
            Forge de votre noyau 3×3
          </h4>
          <KernelEditor kernel={playerKernel} onChange={setPlayerKernel} />
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Précision de ressemblance
            </h4>
            <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden border border-stone-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSuccess ? 'bg-green-600' : 'bg-orange-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-500 font-mono">
              <span>Seuil de validation : 80%</span>
              <span className="font-bold">{score} / 100</span>
            </div>

            {isSuccess && (
              <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-900 text-xs font-bold flex items-center gap-1.5">
                <span>✓</span>
                <span>
                  Défi relevé avec brio ! Votre noyau isole magnifiquement la crête.
                </span>
              </div>
            )}
          </div>

          {/* Progressive Hints */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-stone-700">
                Indices du Guide ({revealedHints} / {HINTS.length})
              </h5>
              {revealedHints < HINTS.length && (
                <button
                  type="button"
                  onClick={handleRevealNextHint}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                >
                  Débloquer un indice 💡
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {HINTS.slice(0, revealedHints).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white rounded-lg border border-stone-200 text-xs text-stone-600"
                >
                  {hint}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
