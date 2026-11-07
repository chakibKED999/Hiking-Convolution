import React, { useState, useCallback, useMemo } from 'react';
import { T } from '@/data/texts';
import { generateTerrain, type TerrainPreset } from '@/core/terrain';
import { convolve2d, type Kernel2D } from '@/core/convolve2d';
import { slopeMap } from '@/core/slope';
import {
  boxBlur,
  gaussian,
  sharpen,
  laplacian,
  emboss,
  sobelX,
  sobelY,
} from '@/core/kernels';
import { getPixel, type BorderMode } from '@/core/grid';
import PixelGrid from '@/components/PixelGrid';
import KernelEditor from '@/components/KernelEditor';
import StepCalculator from '@/components/StepCalculator';

const REQUIRED_FILTERS = 3;

type PresetKey =
  | 'boxBlur'
  | 'gaussian'
  | 'sharpen'
  | 'laplacian'
  | 'emboss'
  | 'sobelX'
  | 'sobelY'
  | 'slope';

interface FilterConfig {
  kernel: Kernel2D;
  isSlope: boolean;
  name: string;
}

const FILTER_PRESETS: Record<PresetKey, FilterConfig> = {
  boxBlur: { kernel: boxBlur, isSlope: false, name: T.filters.boxBlur.name },
  gaussian: { kernel: gaussian, isSlope: false, name: T.filters.gaussian.name },
  sharpen: { kernel: sharpen, isSlope: false, name: T.filters.sharpen.name },
  laplacian: { kernel: laplacian, isSlope: false, name: T.filters.laplacian.name },
  emboss: { kernel: emboss, isSlope: false, name: T.filters.emboss.name },
  sobelX: { kernel: sobelX, isSlope: false, name: T.filters.sobelX.name },
  sobelY: { kernel: sobelY, isSlope: false, name: T.filters.sobelY.name },
  slope: { kernel: sobelX, isSlope: true, name: T.filters.slope.name },
};

const DEFAULT_CUSTOM: Kernel2D = {
  values: [0, -1, 0, -1, 4, -1, 0, -1, 0],
  divisor: 1,
  offset: 0,
};

interface Level6Props {
  onComplete: () => void;
}

/**
 * Level 6: "Falaises du Crépuscule & L'atelier du cartographe".
 * Full cartographer toolkit: presets (blur, sharpen, edges, hillshade, slope),
 * custom 3x3 kernel editor, live pixel inspector, and massif/plateau terrain presets.
 * Success: 3 filters tested.
 */
export default function Level6({ onComplete }: Level6Props): React.JSX.Element {
  const [terrainType, setTerrainType] = useState<TerrainPreset>('massif');
  const [activeFilterKey, setActiveFilterKey] = useState<PresetKey | 'custom'>('boxBlur');
  const [customKernel, setCustomKernel] = useState<Kernel2D>(DEFAULT_CUSTOM);
  const [testedFilters, setTestedFilters] = useState<Set<string>>(new Set());
  const [inspectedPos, setInspectedPos] = useState<{ x: number; y: number } | null>(null);
  const [borderMode] = useState<BorderMode>('clamp');

  const terrain = useMemo(() => {
    return generateTerrain(terrainType, 73, 16);
  }, [terrainType]);

  const activeConfig =
    activeFilterKey === 'custom'
      ? { kernel: customKernel, isSlope: false, name: '✏️ Noyau sur mesure' }
      : (FILTER_PRESETS[activeFilterKey] ?? FILTER_PRESETS.boxBlur);

  const filteredGrid = useMemo(() => {
    if (activeConfig.isSlope) {
      return slopeMap(terrain, borderMode);
    }
    return convolve2d(terrain, activeConfig.kernel, { borderMode });
  }, [terrain, activeConfig, borderMode]);

  const handleSelectFilter = useCallback(
    (key: PresetKey | 'custom') => {
      setActiveFilterKey(key);
      setTestedFilters((prev) => {
        const next = new Set(prev);
        next.add(key);
        if (next.size >= REQUIRED_FILTERS) {
          onComplete();
        }
        return next;
      });
    },
    [onComplete],
  );

  const inspectedNeighbours = inspectedPos
    ? Array.from({ length: 9 }, (_, idx) => {
        const kx = (idx % 3) - 1;
        const ky = Math.floor(idx / 3) - 1;
        return getPixel(terrain, inspectedPos.x + kx, inspectedPos.y + ky, borderMode);
      })
    : null;

  const levelInfo = T.levels.find((l) => l.id === 4);
  const requiresDisplayShift =
    activeFilterKey === 'emboss' ||
    activeFilterKey === 'laplacian' ||
    activeFilterKey === 'sobelX' ||
    activeFilterKey === 'sobelY';

  return (
    <div className="space-y-5">
      <div className="tip-banner">
        <p className="text-sm">{levelInfo?.description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            Relief :
          </span>
          <button
            type="button"
            onClick={() => setTerrainType('massif')}
            className={`chip text-xs font-bold ${terrainType === 'massif' ? 'on' : ''}`}
          >
            🏔️ Massif (Sommets & Lac)
          </button>
          <button
            type="button"
            onClick={() => setTerrainType('plateau')}
            className={`chip text-xs font-bold ${terrainType === 'plateau' ? 'on' : ''}`}
          >
            🗻 Plateau (Ligne de falaise)
          </button>
        </div>

        <div className="score-pill text-xs">
          Outils testés : {testedFilters.size} / {REQUIRED_FILTERS}
        </div>
      </div>

      {/* Preset Chips Row */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(FILTER_PRESETS) as PresetKey[]).map((key) => {
          const cfg = FILTER_PRESETS[key];
          if (!cfg) return null;
          const isSelected = activeFilterKey === key;
          const isDone = testedFilters.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectFilter(key)}
              className={`chip text-xs font-bold ${isSelected ? 'on' : ''} ${
                isDone && !isSelected ? 'border-[var(--ok)] text-[var(--ok)]' : ''
              }`}
            >
              {cfg.name} {isDone && !isSelected && '✓'}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handleSelectFilter('custom')}
          className={`chip text-xs font-bold ${activeFilterKey === 'custom' ? 'on' : ''}`}
        >
          ✏️ Personnalisé
        </button>
      </div>

      {requiresDisplayShift && (
        <div className="tip-banner text-xs">
          <strong>Note de cartographie :</strong> Ce filtre différentiel génère des
          valeurs négatives ou au-delà de 255.
          {activeFilterKey === 'emboss'
            ? ' Un décalage de +128 est appliqué pour centrer la lumière neutre sur le gris moyen.'
            : ' Les valeurs négatives sont écrêtées à 0 (noir) et les dépassements à 255 (blanc) pour la visualisation.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="card-panel flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Carte source (cliquez pour inspecter)
          </span>
          <PixelGrid
            grid={terrain}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            highlightWindow={inspectedPos}
            onCellClick={(x, y) => setInspectedPos({ x, y })}
            ariaLabel="Carte d'altitude source"
          />
        </div>

        <div className="card-panel flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {activeConfig.name}
          </span>
          <PixelGrid
            grid={filteredGrid}
            cellSize={20}
            showNumbers={false}
            showGrid={true}
            ariaLabel="Résultat de la convolution"
          />
        </div>
      </div>

      {activeFilterKey === 'custom' && (
        <div className="card-panel max-w-sm mx-auto space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] text-center">
            Atelier de forge du noyau 3×3
          </h4>
          <KernelEditor kernel={customKernel} onChange={setCustomKernel} />
        </div>
      )}

      {inspectedPos && inspectedNeighbours && (
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2">
            Inspection en direct du point ({inspectedPos.x}, {inspectedPos.y})
          </h4>
          <StepCalculator
            pixels={inspectedNeighbours}
            coefficients={activeConfig.kernel.values}
            divisor={activeConfig.kernel.divisor}
            offset={activeConfig.kernel.offset}
          />
        </div>
      )}
    </div>
  );
}
