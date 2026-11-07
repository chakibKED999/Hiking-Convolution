import React from 'react';
import { T } from '@/data/texts';

export interface MapZone {
  id: number;
  title: string;
  subtitle: string;
  season: string;
  weather: string;
  complete: boolean;
  unlocked: boolean;
  difficulty: string;
}

interface AdventureMapProps {
  zones: MapZone[];
  currentId: number;
  onSelect: (id: number) => void;
}

const DEFAULT_SEASON_CONFIG = {
  bg: 'linear-gradient(135deg, #79A98A, #B7D7B0)',
  icon: '🌸',
  accent: '#79A98A',
  weatherBadge: '🌸 Matin clair',
};

const SEASON_CONFIG: Record<string, typeof DEFAULT_SEASON_CONFIG> = {
  spring: DEFAULT_SEASON_CONFIG,
  summer: {
    bg: 'linear-gradient(135deg, #FFB347, #FF7F50)',
    icon: '☀️',
    accent: '#FFB347',
    weatherBadge: '☀️ Soleil éclatant',
  },
  fall: {
    bg: 'linear-gradient(135deg, #B86B3D, #8C4A32)',
    icon: '🍂',
    accent: '#B86B3D',
    weatherBadge: '🍂 Brume dorée',
  },
  winter: {
    bg: 'linear-gradient(135deg, #6286A8, #A8C5DF)',
    icon: '❄️',
    accent: '#6286A8',
    weatherBadge: '❄️ Sommets gelés',
  },
};

/**
 * AdventureMap — Visual 4-Season & Summit Expedition Map.
 */
export default function AdventureMap({
  zones,
  currentId,
  onSelect,
}: AdventureMapProps): React.JSX.Element {
  return (
    <nav aria-label={T.nav.levels} className="w-full">
      {/* Map Header */}
      <div className="px-2 pb-3 flex items-center justify-between border-b border-[var(--line)] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-hidden="true">🗺️</span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">
              Carte de l'Expédition des 4 Saisons
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              Printemps · Été · Automne · Hiver
            </p>
          </div>
        </div>
        <div className="score-pill text-xs">
          <span>{zones.filter((z) => z.complete).length} / {zones.length}</span>
          <span className="text-[10px] opacity-80">étapes</span>
        </div>
      </div>

      {/* Zone Cards Row */}
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-1">
        {zones.map((zone) => {
          const cfg = SEASON_CONFIG[zone.season] ?? DEFAULT_SEASON_CONFIG;
          const isCurrent = zone.id === currentId;
          const isLocked = !zone.unlocked;

          return (
            <li key={zone.id} className="flex">
              <button
                type="button"
                onClick={() => !isLocked && onSelect(zone.id)}
                disabled={isLocked}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={isLocked ? `${zone.title} (verrouillée)` : zone.title}
                className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed border-[var(--line)] bg-[var(--panel)]'
                    : isCurrent
                      ? 'border-[var(--primary)] shadow-md ring-2 ring-[var(--primary)] bg-[var(--panel)] scale-[1.02]'
                      : 'border-[var(--line)] hover:border-[var(--primary)] bg-[var(--panel)] hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Weather & Season Banner */}
                <div
                  className="px-3 py-1.5 flex items-center justify-between text-white text-xs font-bold"
                  style={{ background: isLocked ? '#9ca3af' : cfg.bg }}
                >
                  <span className="text-base">{isLocked ? '🔒' : cfg.icon}</span>
                  <span className="text-[10px] tracking-wide opacity-95">
                    {zone.id === 5 ? 'Examen' : `Session ${zone.id}`}
                  </span>
                  {zone.complete && (
                    <span className="bg-white/30 rounded-full px-1 text-[10px]">✓</span>
                  )}
                </div>

                {/* Body info */}
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                  <div>
                    <div className="text-xs font-extrabold text-[var(--text)] line-clamp-1">
                      {zone.title.replace(/^[^\w]*/, '')}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] line-clamp-1">
                      {zone.subtitle}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <span className="text-[var(--muted)]">{zone.difficulty}</span>
                    {zone.complete ? (
                      <span className="text-[var(--ok)] font-bold">✓ Conquise</span>
                    ) : isCurrent ? (
                      <span className="font-bold text-[var(--primary)]">En cours ▶</span>
                    ) : isLocked ? (
                      <span className="text-[var(--muted)]">Verrouillée</span>
                    ) : (
                      <span className="text-[var(--text)] font-semibold">Ouvrir →</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
