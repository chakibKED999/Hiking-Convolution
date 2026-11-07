import React from 'react';
import type { Kernel2D } from '@/core/convolve2d';

interface KernelEditorProps {
  kernel: Kernel2D;
  onChange: (kernel: Kernel2D) => void;
  readOnly?: boolean;
}

/**
 * KernelEditor lets users interact with and customize a 3×3 matrix,
 * adjust the divisor, and automatically normalize by the coefficient sum.
 */
export default function KernelEditor({
  kernel,
  onChange,
  readOnly = false,
}: KernelEditorProps): React.JSX.Element {
  const handleCellChange = (idx: number, raw: string) => {
    const val = parseFloat(raw);
    if (Number.isNaN(val)) return;

    const nextValues = [...kernel.values];
    nextValues[idx] = val;
    onChange({ ...kernel, values: nextValues });
  };

  const handleDivisorChange = (raw: string) => {
    const val = parseFloat(raw);
    if (!Number.isNaN(val) && val !== 0) {
      onChange({ ...kernel, divisor: val });
    }
  };

  const handleAutoNormalize = () => {
    const sum = kernel.values.reduce((acc, curr) => acc + curr, 0);
    if (sum !== 0) {
      onChange({ ...kernel, divisor: sum });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-xs">
      <div
        className="grid grid-cols-3 gap-1.5 w-44 mx-auto"
        role="group"
        aria-label="Matrice du noyau 3×3"
      >
        {kernel.values.map((v, i) => (
          <input
            key={i}
            type="number"
            value={v}
            readOnly={readOnly}
            step={1}
            onChange={(e) => handleCellChange(i, e.target.value)}
            className="w-full h-10 text-center rounded border border-stone-300 font-mono text-sm font-semibold bg-stone-50 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
            aria-label={`Coefficient ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 border-t border-stone-100 text-sm">
        <span className="font-mono font-bold text-stone-500">÷</span>
        <input
          type="number"
          value={kernel.divisor}
          readOnly={readOnly}
          step={1}
          onChange={(e) => handleDivisorChange(e.target.value)}
          className="w-20 h-8 text-center rounded border border-stone-300 font-mono text-sm font-semibold bg-stone-50 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
          aria-label="Diviseur du noyau"
        />

        {!readOnly && (
          <button
            type="button"
            onClick={handleAutoNormalize}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 transition-colors cursor-pointer"
            title="Ajuste le diviseur pour qu'il soit égal à la somme des 9 coefficients"
          >
            Normaliser auto
          </button>
        )}
      </div>
    </div>
  );
}
