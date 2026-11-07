import React, { useState } from 'react';
import type { Grid } from '@/core/grid';
import { useCanvasGrid, type GridColorMode } from '@/hooks/useCanvasGrid';
import { T } from '@/data/texts';

interface PixelGridProps {
  grid: Grid;
  cellSize?: number;
  showNumbers?: boolean;
  showGrid?: boolean;
  useTopo?: boolean;
  colorMode?: GridColorMode;
  allowColorToggle?: boolean;
  highlightWindow?: { x: number; y: number } | null;
  highlightedCells?: ReadonlySet<number>;
  onCellClick?: (x: number, y: number, value: number) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * PixelGrid renders a 2D image matrix onto an HTML5 canvas.
 * Includes optional topographic/difficulty colorization, cell gridlines, and 3x3 window highlight.
 */
export default function PixelGrid({
  grid,
  cellSize = 32,
  showNumbers = false,
  showGrid = true,
  useTopo = false,
  colorMode: initialColorMode,
  allowColorToggle = true,
  highlightWindow = null,
  highlightedCells,
  onCellClick,
  className = '',
  ariaLabel,
}: PixelGridProps): React.JSX.Element {
  const defaultMode: GridColorMode = initialColorMode ?? (useTopo ? 'topo' : 'grayscale');
  const [activeColorMode, setActiveColorMode] = useState<GridColorMode>(defaultMode);

  const opts = {
    cellSize,
    showNumbers,
    showGrid,
    colorMode: initialColorMode ?? activeColorMode,
    highlightWindow,
    highlightedCells,
  };

  const { canvasRef, handleClick } = useCanvasGrid(grid, opts, onCellClick);

  const togglePalette = () => {
    setActiveColorMode((prev) => (prev === 'topo' ? 'grayscale' : 'topo'));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {allowColorToggle && !initialColorMode && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={togglePalette}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-200/80 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer border border-stone-300"
            aria-pressed={activeColorMode === 'topo'}
          >
            <span>{activeColorMode === 'topo' ? '🗺️' : '⬛'}</span>
            <span>{T.contours.toggle}</span>
          </button>
        </div>
      )}

      <div className="overflow-auto max-w-full rounded-lg border border-stone-300 bg-stone-900/5 p-1 shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          role="img"
          aria-label={ariaLabel ?? 'Grille altimétrique'}
          tabIndex={0}
          className="block mx-auto cursor-crosshair touch-none select-none"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}
