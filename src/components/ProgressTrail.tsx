import React from 'react';
import { T } from '@/data/texts';

export interface TrailStage {
  id: number;
  title: string;
  difficulty: string;
  complete: boolean;
  unlocked: boolean;
}

interface ProgressTrailProps {
  stages: TrailStage[];
  currentId: number;
  onSelect: (id: number) => void;
}

/**
 * ProgressTrail shows a hiking itinerary with mountain shelters (refuges)
 * representing successive levels, locked sequentially until cleared.
 */
export default function ProgressTrail({
  stages,
  currentId,
  onSelect,
}: ProgressTrailProps): React.JSX.Element {
  return (
    <nav aria-label={T.nav.progress} className="w-full">
      <ol className="flex flex-wrap items-center justify-center gap-2 p-3">
        {stages.map((stage, idx) => {
          const isCurrent = stage.id === currentId;
          const isLocked = !stage.unlocked;

          let btnClasses =
            'group relative flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all border';

          if (isLocked) {
            btnClasses +=
              ' bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60';
          } else if (isCurrent) {
            btnClasses +=
              ' bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300 ring-offset-1 scale-105';
          } else if (stage.complete) {
            btnClasses +=
              ' bg-green-700 text-white border-green-800 hover:bg-green-800 cursor-pointer';
          } else {
            btnClasses +=
              ' bg-white text-stone-700 border-stone-300 hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer shadow-xs';
          }

          return (
            <li key={stage.id} className="flex items-center gap-2">
              {idx > 0 && (
                <span
                  className="text-stone-300 font-bold select-none text-sm hidden sm:inline"
                  aria-hidden="true"
                >
                  •••
                </span>
              )}
              <button
                type="button"
                onClick={() => !isLocked && onSelect(stage.id)}
                disabled={isLocked}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={isLocked ? `${stage.title} (verrouillé)` : stage.title}
                className={btnClasses}
              >
                <span className="text-base leading-none mb-1" aria-hidden="true">
                  {isLocked ? '🔒' : stage.complete ? '✓' : '⛺'}
                </span>
                <span className="truncate max-w-[110px] text-center leading-tight">
                  {stage.title}
                </span>
                <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5 font-normal">
                  {stage.difficulty}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
