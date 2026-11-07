import React, { useState, useMemo, useRef, useEffect } from 'react';
import { T } from '@/data/texts';
import { createRng, nextFloat } from '@/core/random';
import { convolve1d, type Kernel1D } from '@/core/convolve1d';

const SAMPLES_COUNT = 36;
const SEED = 88;
const MOVING_AVERAGE_KERNEL: Kernel1D = {
  values: [1, 1, 1],
  divisor: 3,
  offset: 0,
};

function generateTrailProfile(seed: number): number[] {
  const rng = createRng(seed);
  const profile: number[] = [];

  for (let i = 0; i < SAMPLES_COUNT; i++) {
    const slope = Math.sin((i / SAMPLES_COUNT) * Math.PI) * 110;
    const microVariation = (nextFloat(rng) - 0.5) * 16;
    const alt = Math.max(20, Math.min(235, 60 + slope + microVariation));
    profile.push(Math.round(alt));
  }

  // Artificial GPS jump / glitch at index 18
  const glitchIndex = 18;
  profile[glitchIndex] = Math.min(255, (profile[glitchIndex] ?? 100) + 85);

  return profile;
}

const RAW_PROFILE = generateTrailProfile(SEED);

interface Level2Props {
  onComplete: () => void;
}

function renderProfileCanvas(
  canvas: HTMLCanvasElement | null,
  data: readonly number[],
  lineColor: string,
  fillColor: string,
  markerIndex?: number,
): void {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background and gridlines
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 1;
  for (let yStep = 0; yStep <= 255; yStep += 64) {
    const yPos = h - (yStep / 255) * (h - 20) - 10;
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(w, yPos);
    ctx.stroke();
  }

  // Profile path
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * (w - 24) + 12;
    const y = h - (val / 255) * (h - 20) - 10;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Shaded area
  ctx.lineTo(w - 24 + 12, h);
  ctx.lineTo(12, h);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Noise spike indicator
  if (markerIndex !== undefined) {
    const val = data[markerIndex] ?? 0;
    const mx = (markerIndex / (data.length - 1)) * (w - 24) + 12;
    const my = h - (val / 255) * (h - 20) - 10;

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Level 2: "Le profil du sentier".
 * 1D moving average convolution to clean noisy GPS altitude logs.
 * Condition: Smooth the profile and identify the reduced noise spike.
 */
export default function Level2({ onComplete }: Level2Props): React.JSX.Element {
  const [isSmoothed, setIsSmoothed] = useState(false);
  const [spikeIdentified, setSpikeIdentified] = useState(false);

  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const smoothCanvasRef = useRef<HTMLCanvasElement>(null);

  const smoothedProfile = useMemo(() => {
    return convolve1d(RAW_PROFILE, MOVING_AVERAGE_KERNEL);
  }, []);

  useEffect(() => {
    renderProfileCanvas(
      rawCanvasRef.current,
      RAW_PROFILE,
      '#57534e',
      'rgba(120, 113, 108, 0.12)',
      18,
    );
  }, []);

  useEffect(() => {
    if (isSmoothed) {
      renderProfileCanvas(
        smoothCanvasRef.current,
        smoothedProfile,
        '#15803d',
        'rgba(34, 197, 94, 0.15)',
        18,
      );
    }
  }, [isSmoothed, smoothedProfile]);

  const handleApplyFilter = () => {
    setIsSmoothed(true);
  };

  const handleIdentifySpike = () => {
    setSpikeIdentified(true);
    onComplete();
  };

  const levelInfo = T.levels[1];
  const spikeRawVal = RAW_PROFILE[18] ?? 0;
  const spikeSmoothVal = smoothedProfile[18] ?? 0;

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Profil GPS d'origine (avec parasite à l'indice 18)
            </h4>
            <span className="text-xs font-mono text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
              Pic parasite = {spikeRawVal} m
            </span>
          </div>
          <canvas
            ref={rawCanvasRef}
            width={600}
            height={130}
            className="w-full rounded-lg border border-stone-200"
            aria-label="Graphique 1D de l'altitude GPS brute"
          />
        </div>

        {!isSmoothed ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-700 hover:bg-green-800 text-white shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🌊</span>
              <span>Lisser avec le noyau 1D [1, 1, 1] ÷ 3</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50/40 p-4 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-800">
                  Profil filtré par convolution 1D
                </h4>
                <span className="text-xs font-mono text-green-800 bg-green-100 px-2 py-0.5 rounded">
                  Altitude filtrée au pic = {spikeSmoothVal} m
                </span>
              </div>
              <canvas
                ref={smoothCanvasRef}
                width={600}
                height={130}
                className="w-full rounded-lg border border-green-200"
                aria-label="Graphique 1D de l'altitude lissée"
              />
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-stone-700 space-y-1">
                <p className="font-semibold text-stone-900">
                  Observation du randonneur :
                </p>
                <p>
                  À l'indice 18, la convolution a remplacé {spikeRawVal} par{' '}
                  <strong className="text-green-700 font-mono">{spikeSmoothVal}</strong> =
                  ({RAW_PROFILE[17]} + {spikeRawVal} + {RAW_PROFILE[19]}) ÷ 3.
                </p>
              </div>

              {!spikeIdentified ? (
                <button
                  type="button"
                  onClick={handleIdentifySpike}
                  className="px-4 py-2 rounded-lg font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Confirmer la suppression du pic
                </button>
              ) : (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-300">
                  ✓ Pic validé et sentier sécurisé !
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
