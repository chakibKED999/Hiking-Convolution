import React from 'react';
import { T } from '@/data/texts';
import { clampByte } from '@/core/grid';

interface StepCalculatorProps {
  /** 9 neighbour pixel altitudes in row-major order. */
  pixels: readonly number[];
  /** 9 kernel coefficients in row-major order. */
  coefficients: readonly number[];
  divisor: number;
  offset?: number;
}

/**
 * StepCalculator renders the transparent arithmetic of a 3×3 convolution:
 * Formatted as a spatial 3×3 matrix with cell products, followed by the sum, division, and clamping.
 */
export default function StepCalculator({
  pixels,
  coefficients,
  divisor,
  offset = 0,
}: StepCalculatorProps): React.JSX.Element {
  const products = pixels.map((p, i) => p * (coefficients[i] ?? 0));
  const sum = products.reduce((acc, curr) => acc + curr, 0);
  const rawDivided = sum / divisor;
  const withOffset = rawDivided + offset;
  const clamped = clampByte(withOffset);

  return (
    <div className="card-panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          {T.calculator.title} (Fenêtre 3×3)
        </h3>
        <span className="mono chip py-0.5 px-2 text-[11px] font-bold">
          ÷ {divisor}
        </span>
      </div>

      {/* 3×3 Spatial Matrix Table */}
      <div className="flex justify-center py-1">
        <table className="k">
          <tbody>
            {[0, 1, 2].map((row) => (
              <tr key={row}>
                {[0, 1, 2].map((col) => {
                  const idx = row * 3 + col;
                  const val = pixels[idx] ?? 0;
                  const coeff = coefficients[idx] ?? 0;
                  const prod = products[idx] ?? 0;
                  const isCenter = idx === 4;

                  return (
                    <td
                      key={col}
                      className={isCenter ? 'ring-2 ring-[var(--b)] font-bold' : ''}
                      title={`Voisin ${idx + 1} : altitude ${val} × poids ${coeff} = ${prod}`}
                    >
                      <span className="font-bold text-sm block">{val}</span>
                      <small>
                        × {coeff} = <b>{prod}</b>
                      </small>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation Summary Formula */}
      <div className="tip-banner space-y-1.5 mono text-xs">
        <div className="flex justify-between items-center text-[var(--muted)]">
          <span>Somme des 9 produits :</span>
          <span className="font-bold text-[var(--text)]">{sum}</span>
        </div>

        <div className="flex justify-between items-center text-[var(--muted)]">
          <span>Moyenne pondérée (÷ {divisor}) :</span>
          <span className="font-bold text-[var(--text)]">{rawDivided.toFixed(1)}</span>
        </div>

        {offset !== 0 && (
          <div className="flex justify-between items-center text-[var(--muted)]">
            <span>Décalage relief (+ {offset}) :</span>
            <span className="font-bold text-[var(--text)]">{withOffset.toFixed(1)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-1.5 border-t border-[color-mix(in_srgb,var(--c)_30%,transparent)] font-bold text-sm text-[var(--text)]">
          <span>{T.calculator.result} :</span>
          <span className="text-base" style={{ color: 'var(--a)' }}>{clamped} / 255</span>
        </div>
      </div>
    </div>
  );
}
