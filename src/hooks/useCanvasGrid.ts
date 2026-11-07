import { useRef, useEffect, useCallback } from 'react';
import type { Grid } from '@/core/grid';

export type GridColorMode = 'grayscale' | 'topo' | 'slopeDifficulty';

/** Topographic elevation color palette: maps [0-255] to terrain colors. */
function topoColor(value: number): string {
  if (value < 30) return '#1d4ed8'; // deep lake / valley water
  if (value < 60) return '#38bdf8'; // stream / shallow water
  if (value < 100) return '#2e7d32'; // lush forest
  if (value < 140) return '#84cc16'; // subalpine pasture
  if (value < 180) return '#facc15'; // rocky grassland
  if (value < 215) return '#ea580c'; // steep crags
  if (value < 240) return '#78716c'; // rocky summits
  return '#f8fafc'; // snowcap
}

/** Slope difficulty color palette: green -> yellow -> orange -> red. */
function slopeDifficultyColor(magnitude: number): string {
  if (magnitude < 30) return '#16a34a'; // Vert (pente douce / marche aisée)
  if (magnitude < 70) return '#84cc16'; // Vert-citron (pente modérée)
  if (magnitude < 120) return '#eab308'; // Jaune (terrain accidenté)
  if (magnitude < 180) return '#f97316'; // Orange (escarpement technique)
  return '#dc2626'; // Rouge vif (falaise verticale / barres rocheuses)
}

/** Grayscale representation for direct matrix inspection. */
function grayColor(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  const hex = clamped.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

export interface CanvasGridOptions {
  cellSize: number;
  showNumbers: boolean;
  showGrid: boolean;
  colorMode: GridColorMode;
  highlightWindow?: { x: number; y: number } | null;
  highlightedCells?: ReadonlySet<number>;
}

/**
 * Draws a Grid onto an HTML5 canvas element with high fidelity.
 * Never modifies the underlying numerical grid data.
 */
export function drawGrid(
  canvas: HTMLCanvasElement,
  grid: Grid,
  opts: CanvasGridOptions,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    cellSize,
    showNumbers,
    showGrid,
    colorMode,
    highlightWindow,
    highlightedCells,
  } = opts;
  const { width, height, data } = grid;

  const targetWidth = width * cellSize;
  const targetHeight = height * cellSize;

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const value = data[idx] ?? 0;

      if (colorMode === 'topo') {
        ctx.fillStyle = topoColor(value);
      } else if (colorMode === 'slopeDifficulty') {
        ctx.fillStyle = slopeDifficultyColor(value);
      } else {
        ctx.fillStyle = grayColor(value);
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

      // Distinct border for already visited/calculated cells
      if (highlightedCells?.has(idx)) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      }

      // Highlight the 3×3 inspection window
      if (highlightWindow) {
        const { x: hx, y: hy } = highlightWindow;
        const inWindow = Math.abs(x - hx) <= 1 && Math.abs(y - hy) <= 1;

        if (inWindow) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        if (x === hx && y === hy) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.55)';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
      }

      // Numerical overlay
      if (showNumbers && cellSize >= 22) {
        ctx.fillStyle =
          colorMode !== 'grayscale'
            ? value < 60 || value > 215
              ? '#ffffff'
              : '#0c0a09'
            : value > 128
              ? '#0c0a09'
              : '#ffffff';
        ctx.font = `600 ${Math.max(9, Math.floor(cellSize * 0.36))}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          String(value),
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
        );
      }
    }
  }

  if (showGrid) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + 0.5, 0);
      ctx.lineTo(x * cellSize + 0.5, height * cellSize);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize + 0.5);
      ctx.lineTo(width * cellSize, y * cellSize + 0.5);
      ctx.stroke();
    }
  }
}

/**
 * Hook to manage interactive canvas grid rendering, mouse clicks, and drag coordination.
 */
export function useCanvasGrid(
  grid: Grid | null,
  opts: CanvasGridOptions,
  onCellClick?: (x: number, y: number, value: number) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    drawGrid(canvas, grid, opts);
  }, [grid, opts]);

  const handlePointerAction = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !grid) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const px = Math.floor(((e.clientX - rect.left) * scaleX) / opts.cellSize);
      const py = Math.floor(((e.clientY - rect.top) * scaleY) / opts.cellSize);

      if (px >= 0 && px < grid.width && py >= 0 && py < grid.height) {
        const value = grid.data[py * grid.width + px] ?? 0;
        onCellClick?.(px, py, value);
      }
    },
    [grid, opts.cellSize, onCellClick],
  );

  return { canvasRef, handleClick: handlePointerAction };
}
