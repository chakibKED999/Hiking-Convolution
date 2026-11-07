import React, { useState, useMemo, useCallback } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { sobelComponents, findSteepestPixel } from '@/core/slope';
import PixelGrid from '@/components/PixelGrid';
import HikerMascot from '@/components/HikerMascot';

const GRID_SIZE = 14;
const SEED = 42;
const TERRAIN = generateTerrain('massif', SEED, GRID_SIZE);

interface Level7Props {
  onComplete: () => void;
}

/**
 * Level 7: "La carte des pentes".
 * Displays Sobel X and Sobel Y partial derivatives separately,
 * then combines them into a slope difficulty map (green -> yellow -> red).
 * Condition: Locate and click the steepest area of the massif.
 */
export default function Level7({ onComplete }: Level7Props): React.JSX.Element {
  const [inspectedPos, setInspectedPos] = useState<{ x: number; y: number } | null>(null);
  const [foundSteepest, setFoundSteepest] = useState(false);

  // Compute Sobel components using the core library
  const { gxVisual, gyVisual, magnitude } = useMemo(() => {
    return sobelComponents(TERRAIN, 'clamp');
  }, []);

  // Locate the true steepest pixel deterministically via core
  const steepest = useMemo(() => {
    return findSteepestPixel(magnitude);
  }, [magnitude]);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setInspectedPos({ x, y });

      // Check distance to the steepest pixel (allow 1 pixel tolerance for friendly UX)
      const dist = Math.hypot(x - steepest.x, y - steepest.y);
      if (dist <= 1.5) {
        setFoundSteepest(true);
        onComplete();
      }
    },
    [steepest, onComplete],
  );

  const inspectedSlope =
    inspectedPos !== null
      ? (magnitude.data[inspectedPos.y * magnitude.width + inspectedPos.x] ?? 0)
      : null;

  const levelInfo = T.levels.find((l) => l.id === 4);

  return (
    <div className="space-y-5">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <HikerMascot
        message="« Le gradient mesure la raideur du sol. Plus la flèche est longue, plus la pente est vertigineuse ! Cliquez sur la zone rouge écarlate où la falaise plonge dans le vide. »"
        size="sm"
      />

      {/* Sobel X & Sobel Y side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-700">
            {T.filters.sobelX.name} (Dérivée Est-Ouest)
          </span>
          <p className="text-[11px] text-stone-500 text-center">
            Pentes vers l'est en clair, pentes vers l'ouest en sombre, plat = gris 128.
          </p>
          <PixelGrid
            grid={gxVisual}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Sobel X visuel"
          />
        </div>

        <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-700">
            {T.filters.sobelY.name} (Dérivée Nord-Sud)
          </span>
          <p className="text-[11px] text-stone-500 text-center">
            Pentes vers le sud en clair, pentes vers le nord en sombre, plat = gris 128.
          </p>
          <PixelGrid
            grid={gyVisual}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            allowColorToggle={false}
            ariaLabel="Sobel Y visuel"
          />
        </div>
      </div>

      {/* Magnitude Difficulty Map */}
      <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
            Carte de difficulté des pentes : √(gx² + gy²)
          </span>
          <h4 className="text-sm font-bold text-stone-800">
            Cliquez sur la carte pour sonder la raideur locale (Cible : Falaise abrupte)
          </h4>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#16a34a]" /> Douce (0-30)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#eab308]" /> Moyenne (70-120)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#f97316]" /> Raide (120-180)
          </span>
          <span className="flex items-center gap-1 font-bold text-red-700">
            <span className="w-3 h-3 rounded-xs bg-[#dc2626]" /> Falaise (&gt;180)
          </span>
        </div>

        <PixelGrid
          grid={magnitude}
          cellSize={24}
          showNumbers={false}
          showGrid={true}
          colorMode="slopeDifficulty"
          allowColorToggle={false}
          highlightWindow={inspectedPos}
          onCellClick={handleCellClick}
          ariaLabel="Carte de raideur de pente"
        />

        {inspectedPos && inspectedSlope !== null && (
          <div className="w-full max-w-md bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Position sondée :</span>
              <span>
                (x: {inspectedPos.x}, y: {inspectedPos.y})
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Magnitude du gradient :</span>
              <span className={inspectedSlope > 180 ? 'text-red-700' : 'text-stone-800'}>
                {inspectedSlope} / 255
              </span>
            </div>
            {foundSteepest && (
              <div className="pt-1 text-green-700 font-bold font-sans">
                ✓ Superbe ! Vous avez localisé la falaise la plus abrupte (indice de
                raideur {steepest.maxSlope}).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
