import React from 'react';

interface HikerMascotProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * HikerMascot — "Rando", the friendly mountain guide.
 */
export default function HikerMascot({
  message,
  size = 'md',
  className = '',
}: HikerMascotProps): React.JSX.Element {
  const pixelSize = size === 'sm' ? 44 : size === 'lg' ? 84 : 64;

  return (
    <div className={`flex items-start gap-3.5 ${className}`}>
      <div
        className="shrink-0 rounded-2xl bg-[var(--panel)] p-1.5 shadow-sm border border-[var(--line)] flex items-center justify-center text-white"
        style={{ width: pixelSize, height: pixelSize }}
        role="img"
        aria-label="Mascotte : Rando, guide de haute montagne"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mountain background silhouette */}
          <polygon points="10,85 45,35 75,85" fill="#44403c" />
          <polygon points="40,85 68,45 92,85" fill="#57534e" />
          <polygon points="45,35 40,45 52,48 50,42" fill="#f5f5f4" />

          {/* Guide Body / Jacket */}
          <rect x="36" y="58" width="28" height="32" rx="6" fill="#ea580c" />
          {/* Backpack straps */}
          <rect x="38" y="60" width="4" height="24" rx="2" fill="#1c1917" />
          <rect x="58" y="60" width="4" height="24" rx="2" fill="#1c1917" />

          {/* Neck & Head */}
          <rect x="44" y="48" width="12" height="12" rx="3" fill="#fbcfe8" />
          <circle cx="50" cy="40" r="14" fill="#fed7aa" />

          {/* Beard / Smile */}
          <path d="M42 42 C45 50 55 50 58 42 Z" fill="#78350f" />
          <circle cx="46" cy="38" r="1.8" fill="#1c1917" />
          <circle cx="54" cy="38" r="1.8" fill="#1c1917" />

          {/* Alpine Cap with peak */}
          <path d="M34 34 C34 22 66 22 66 34 Z" fill="#15803d" />
          <rect x="30" y="32" width="40" height="5" rx="2" fill="#166534" />
          <circle cx="50" cy="22" r="3" fill="#ea580c" />

          {/* Hiking stick */}
          <line
            x1="72"
            y1="40"
            x2="68"
            y2="90"
            stroke="#a8a29e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="72" cy="39" r="2.5" fill="#44403c" />
        </svg>
      </div>

      {message && (
        <div className="tip-banner flex-1 my-0 py-3 text-xs text-[var(--text)]">
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--c)' }}>
            Rando — Le Guide IA :
          </div>
          <div className="leading-relaxed italic">{message}</div>
        </div>
      )}
    </div>
  );
}
