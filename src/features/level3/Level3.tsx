import React, { useState, useCallback } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { getPixel } from '@/core/grid';
import { boxBlur } from '@/core/kernels';
import PixelGrid from '@/components/PixelGrid';
import StepCalculator from '@/components/StepCalculator';

const GRID_SIZE = 6;
const SEED = 24;
const TERRAIN_6X6 = generateTerrain('massif', SEED, GRID_SIZE);
const REQUIRED_CALCS = 4;

interface Level3Props {
  onComplete: () => void;
}

/**
 * Level 3: "La fenêtre 3×3 & le Cœur du Calcul".
 * User selects a pixel on a 6×6 grid, reviews the 3×3 field of view,
 * inspects the 9 dot products, and validates the calculation.
 * Success: 4 pixels computed.
 */
export default function Level3({ onComplete }: Level3Props): React.JSX.Element {
  const [selectedPos, setSelectedPos] = useState<{ x: number; y: number } | null>(null);
  const [calculatedCells, setCalculatedCells] = useState<Set<number>>(new Set());

  const handleCellClick = useCallback((x: number, y: number) => {
    setSelectedPos({ x, y });
  }, []);

  const handleValidateCalculation = () => {
    if (!selectedPos) return;

    setCalculatedCells((prev) => {
      const next = new Set(prev);
      next.add(selectedPos.y * TERRAIN_6X6.width + selectedPos.x);
      if (next.size >= REQUIRED_CALCS) {
        onComplete();
      }
      return next;
    });
  };

  const neighbours = selectedPos
    ? Array.from({ length: 9 }, (_, idx) => {
        const kx = (idx % 3) - 1;
        const ky = Math.floor(idx / 3) - 1;
        return getPixel(TERRAIN_6X6, selectedPos.x + kx, selectedPos.y + ky, 'clamp');
      })
    : null;

  const levelInfo = T.levels.find((l) => l.id === 2);

  return (
    <div className="space-y-4">
      <div className="tip-banner">
        <p className="text-sm">{levelInfo?.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="card-panel flex flex-col items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] self-start">
            Carte d'altitude (6×6 cases)
          </div>
          <PixelGrid
            grid={TERRAIN_6X6}
            cellSize={44}
            showNumbers={true}
            showGrid={true}
            useTopo={false}
            highlightWindow={selectedPos}
            highlightedCells={calculatedCells}
            onCellClick={handleCellClick}
            ariaLabel="Grille 6x6 d'altitude avec fenêtrage 3x3"
          />
          <div className="w-full tip-banner flex justify-between items-center text-xs">
            <span>Progression :</span>
            <span className="font-bold mono" style={{ color: 'var(--a)' }}>
              {calculatedCells.size} / {REQUIRED_CALCS} calculs validés
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {selectedPos && neighbours ? (
            <div className="space-y-3">
              <StepCalculator
                pixels={neighbours}
                coefficients={boxBlur.values}
                divisor={boxBlur.divisor}
                offset={boxBlur.offset}
              />
              <button
                type="button"
                onClick={handleValidateCalculation}
                className="btn-adventure w-full text-xs cursor-pointer py-3"
              >
                ✓ Valider le calcul pour la case (x: {selectedPos.x}, y: {selectedPos.y})
              </button>
            </div>
          ) : (
            <div className="card-panel border-dashed p-8 text-center text-[var(--muted)]">
              <span className="text-4xl block mb-2" aria-hidden="true">
                🔭
              </span>
              <p className="text-sm font-bold text-[var(--text)]">
                Aucune case sélectionnée
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Cliquez sur une case de la grille pour poser le randonneur et ouvrir sa
                fenêtre de vue 3×3.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
