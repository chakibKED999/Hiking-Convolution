import React, { useState, useEffect, useRef } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { boxBlur, sharpen, sobelX } from '@/core/kernels';
import HikerMascot from '@/components/HikerMascot';
import type { TrailKernelProgress } from '@/core/storage';
import { getRankFromElevation } from '@/core/storage';

interface HomeHeroProps {
  progress: TrailKernelProgress;
  onStart: (levelId: number) => void;
  onOpenNotebook: () => void;
  onSeasonChange?: (season: string) => void;
}

const DEMO_SIZE = 12;
const DEMO_TERRAIN = generateTerrain('massif', 42, DEMO_SIZE);

const DEMO_FILTERS = [
  {
    name: 'Brouillard (Flou /9)',
    desc: 'Lissage uniforme : les aspérités de la roche s’adoucissent pour révéler les grandes lignes.',
    grid: convolve2d(DEMO_TERRAIN, boxBlur),
  },
  {
    name: 'Jumelles (Netteté)',
    desc: 'Contraste local : les sentiers et corniches rocheuses ressortent nettement.',
    grid: convolve2d(DEMO_TERRAIN, sharpen),
  },
  {
    name: 'Falaises (Sobel)',
    desc: 'Gradient de pente : seules les ruptures abruptes du terrain s’allument.',
    grid: convolve2d(DEMO_TERRAIN, sobelX),
  },
];

const SESSIONS_INTRO = [
  {
    id: 1,
    season: 'spring',
    icon: '🌸',
    seasonName: 'Printemps : Cerisiers en Fleurs',
    themeTag: 'Spring: Cherry blossoms',
    weather: '🌸 Cerisiers en fleurs, pétales et sentier printanier doux',
    title: 'Session 1 : Lire la carte sous les cerisiers — Pixel = Altitude',
    hikingProblem: 'En marchant sous la canopée des cerisiers en fleurs, comment votre GPS sait-il si vous êtes au bord du torrent ou sur le promontoire rocheux ?',
    convolutionSolution: 'Une image numérique en niveaux de gris est une matrice 2D. Chaque pixel contient un nombre de 0 (lac de vallée) à 255 (pic rocheux couvert de pétales). L\'altimètre lit directement cette matrice.',
    practicalTakeaway: 'Savoir lire une carte d\'altitude numérique MNT (Modèle Numérique de Terrain) pour anticiper les dénivelés et les cuvettes sous les arbres en fleurs.',
    gear: '🎒 Dans le sac : Carte topographique IGN numérique & Altimètre barométrique',
    accent: '#79A98A',
  },
  {
    id: 2,
    season: 'summer',
    icon: '🏖️',
    seasonName: 'Été : Plage & Sentier Côtier',
    themeTag: 'Summer: Beach',
    weather: '🏖️ Plage ensoleillée, sable doré & criques rocheuses',
    title: 'Session 2 : La fenêtre 3×3 & le lissage GPS sur la plage',
    hikingProblem: 'En marchant sur le sable et le long des falaises côtières, pourquoi votre montre affiche-t-elle de faux sauts de dénivelé (+80m dans l\'océan) ?',
    convolutionSolution: 'La réverbération sur le sable et la mer crée des échos satellites parasites. La fenêtre glissante 3×3 moyenne chaque point avec ses 8 voisins immédiats pour lisser le tracé et effacer les faux pics marins.',
    practicalTakeaway: 'La moyenne mobile 3×3 est l\'algorithme qui élimine les parasites côtiers pour vous donner le vrai profil de dénivelé de votre sortie en bord de mer.',
    gear: '🎒 Dans le sac : Montre GPS de trail côtier & Filtre de moyenne mobile actif',
    accent: '#FFB347',
  },
  {
    id: 3,
    season: 'fall',
    icon: '🍂',
    seasonName: 'Automne : Forêt d\'Automne',
    themeTag: 'Fall: Autumn forest',
    weather: '🍂 Forêt d\'automne, feuilles cuivrées & brume de sous-bois',
    title: 'Session 3 : Poids des coefficients & Piège de la saturation sous la canopée',
    hikingProblem: 'Sous les arbres dorés de la forêt d\'automne, comment percer la brume sans effacer le sentier ni être ébloui par la saturation ?',
    convolutionSolution: 'Le flou gaussien donne 4× plus de poids au centre (/16) pour préserver le chemin. Le diviseur est vital : si on additionne 9 pixels sans diviser par 9 ou 16, les valeurs dépassent 255 et l\'image sature en blanc pur !',
    practicalTakeaway: 'Comprendre la normalisation des filtres optiques et thermiques pour traverser les sous-bois brumeux sans aveuglement.',
    gear: '🎒 Dans le sac : Lunettes de contraste & Filtre optique anti-éblouissement',
    accent: '#B86B3D',
  },
  {
    id: 4,
    season: 'winter',
    icon: '⛷️',
    seasonName: 'Hiver : Neige & Ski de Rando',
    themeTag: 'Winter: Snow & skiing',
    weather: '❄️ Neige fraîche, combes & couloirs de ski de randonnée',
    title: 'Session 4 : Détecter les couloirs de ski & pentes d\'avalanche (Sobel & Atelier)',
    hikingProblem: 'En ski de randonnée sur la neige vierge, comment repérer à l\'avance les pentes raides supérieures à 30° déclencheuses d\'avalanches ?',
    convolutionSolution: 'Le filtre différentiel de Sobel calcule la dérivée spatiale horizontale (Gx) et verticale (Gy). La magnitude combinée allume instantanément les couloirs critiques (>30°) en rouge vif !',
    practicalTakeaway: 'C\'est l\'algorithme exact utilisé par l\'IGN (couche pentes > 30°) et les secouristes en montagne pour tracer des descentes à ski sécurisées.',
    gear: '🎒 Dans le sac : Détecteur DVA, inclinomètre de pente & Carte des pentes avalancheuses',
    accent: '#6286A8',
  },
];

export default function HomeHero({
  progress,
  onStart,
  onOpenNotebook,
  onSeasonChange,
}: HomeHeroProps): React.JSX.Element {
  const [filterIdx, setFilterIdx] = useState(0);
  const [scanPos, setScanPos] = useState({ x: 2, y: 2 });
  const [activeScrollSeason, setActiveScrollSeason] = useState('spring');

  const canvasRawRef = useRef<HTMLCanvasElement>(null);
  const canvasFilteredRef = useRef<HTMLCanvasElement>(null);
  const sessionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Dual-canvas scanning window simulation
  useEffect(() => {
    let x = 1;
    let y = 1;
    let fIdx = 0;

    const timer = setInterval(() => {
      x++;
      if (x >= DEMO_SIZE - 1) {
        x = 1;
        y++;
        if (y >= DEMO_SIZE - 1) {
          y = 1;
          fIdx = (fIdx + 1) % DEMO_FILTERS.length;
          setFilterIdx(fIdx);
        }
      }
      setScanPos({ x, y });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  // Render preview canvases
  useEffect(() => {
    const rawC = canvasRawRef.current;
    const filtC = canvasFilteredRef.current;
    if (!rawC || !filtC) return;

    const rawCtx = rawC.getContext('2d');
    const filtCtx = filtC.getContext('2d');
    if (!rawCtx || !filtCtx) return;

    const cellSize = 14;
    const size = DEMO_SIZE * cellSize;
    rawC.width = rawC.height = size;
    filtC.width = filtC.height = size;

    // Raw terrain
    DEMO_TERRAIN.data.forEach((val, i) => {
      const cx = (i % DEMO_SIZE) * cellSize;
      const cy = Math.floor(i / DEMO_SIZE) * cellSize;
      rawCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      rawCtx.fillRect(cx, cy, cellSize, cellSize);
    });

    // 3x3 window highlight
    rawCtx.lineWidth = 2.5;
    rawCtx.strokeStyle = 'var(--secondary)';
    rawCtx.strokeRect(
      (scanPos.x - 1) * cellSize + 1,
      (scanPos.y - 1) * cellSize + 1,
      cellSize * 3 - 2,
      cellSize * 3 - 2
    );

    // Filtered terrain
    const currentFiltered = DEMO_FILTERS[filterIdx]?.grid ?? DEMO_TERRAIN;
    currentFiltered.data.forEach((val, i) => {
      const cx = (i % DEMO_SIZE) * cellSize;
      const cy = Math.floor(i / DEMO_SIZE) * cellSize;
      filtCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      filtCtx.fillRect(cx, cy, cellSize, cellSize);
    });

    // Center pixel highlight
    filtCtx.lineWidth = 2.5;
    filtCtx.strokeStyle = 'var(--primary)';
    filtCtx.strokeRect(
      scanPos.x * cellSize + 1,
      scanPos.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  }, [scanPos, filterIdx]);

  // Scroll detection: shifts theme color as each session scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const season = entry.target.getAttribute('data-season-section');
            if (season) {
              setActiveScrollSeason(season);
              if (typeof document !== 'undefined') {
                document.documentElement.dataset.season = season;
              }
              onSeasonChange?.(season);
            }
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: '-10% 0px -25% 0px',
      }
    );

    Object.values(sessionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [onSeasonChange]);

  const rankInfo = getRankFromElevation(progress.elevationGainMeters);
  const nextLevel = progress.lastActiveLevel || 1;
  const isStarted = progress.completedLevels.length > 0;
  const activeFilter = (DEMO_FILTERS[filterIdx] ?? DEMO_FILTERS[0])!;

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Hero Intro Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-4">
        {/* Left Column: Mission Pitch */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 chip text-xs font-bold">
            <span>🥾</span>
            <span>Le Laboratoire du Randonneur Numérique · 4 Saisons Météo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text)] tracking-tight leading-[1.08]">
            Une carte cache ses reliefs.<br />
            <span style={{ color: 'var(--primary)' }}>Mène l’enquête alpine.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl leading-relaxed">
            Quatre sessions météo au fil des saisons pour maîtriser la convolution d'image en pleine nature : <strong>Cerisiers en fleurs 🌸</strong>, <strong>Plage & littoral 🏖️</strong>, <strong>Forêt d'automne 🍂</strong> et <strong>Neige & ski ⛷️</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onStart(nextLevel)}
              className="btn-adventure pulse-cta text-base flex items-center gap-2 cursor-pointer"
            >
              <span>{isStarted ? "🧭 Reprendre l'ascension" : "🥾 Commencer l'Aventure"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenNotebook}
              className="btn-secondary text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>📓</span>
              <span>{T.home.readNotebook}</span>
            </button>
          </div>

          <p className="text-xs text-[var(--muted)] font-mono pt-1">
            ↓ Faites défiler pour explorer le B.A.-BA du randonneur et les 4 saisons météo (les couleurs s'adaptent) !
          </p>
        </div>

        {/* Right Column: Live Dual-Canvas Interactive Box */}
        <div className="lg:col-span-5 card-panel space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Démonstration live</span>
            <span className="mono chip py-0.5 px-2.5 text-[11px] font-bold">
              Fenêtre 3×3 en ({scanPos.x}, {scanPos.y})
            </span>
          </div>

          <div className="flex gap-3 justify-center items-center py-2">
            <figure className="text-center m-0 flex-1">
              <canvas
                ref={canvasRawRef}
                className="w-full max-w-[160px] mx-auto rounded-lg border-2 border-[var(--line)] shadow-xs block image-rendering-pixelated"
                aria-label="Relief brut avant convolution"
              />
              <figcaption className="text-xs font-semibold text-[var(--muted)] mt-1.5">
                Avant (Carte brute)
              </figcaption>
            </figure>

            <figure className="text-center m-0 flex-1">
              <canvas
                ref={canvasFilteredRef}
                className="w-full max-w-[160px] mx-auto rounded-lg border-2 border-[var(--line)] shadow-xs block image-rendering-pixelated"
                aria-label="Relief après application du filtre"
              />
              <figcaption className="text-xs font-semibold text-[var(--muted)] mt-1.5">
                Après ({activeFilter.name})
              </figcaption>
            </figure>
          </div>

          <div className="tip-banner text-xs space-y-1">
            <p className="font-bold text-[var(--text)]">{activeFilter.name}</p>
            <p className="text-[var(--muted)]">{activeFilter.desc}</p>
          </div>
        </div>
      </div>

      {/* 🧭 LE B.A.-BA DU RANDONNEUR CONVOLUTIF (Basis Infos) */}
      <div className="card-panel space-y-5 border-2 border-[var(--primary)]/40 bg-[color-mix(in_srgb,var(--panel)_95%,transparent)]">
        <div>
          <span className="chip on text-xs font-bold uppercase tracking-wider mb-2">
            🧭 Comprendre les bases
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
            {T.hikerPrimer.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
            {T.hikerPrimer.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {T.hikerPrimer.cards.map((card, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 flex flex-col justify-between shadow-xs hover:border-[var(--primary)] transition-colors"
            >
              <div>
                <div className="text-3xl mb-1">{card.icon}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary)]">
                  {card.hikingMetaphor}
                </div>
                <h4 className="font-extrabold text-sm text-[var(--text)] mt-0.5">
                  {card.title}
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed mt-1.5">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 SCROLLABLE SEASON INTRODUCTIONS (Colors shift on scroll) */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">
              Les 4 Saisons de la Randonnée : Idées Pratiques de Terrain
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Chaque session résout un vrai casse-tête rencontré par les randonneurs en pleine nature
            </p>
          </div>
          <div className="chip font-bold text-xs">
            Saison en vue : <b className="capitalize ml-1 text-[var(--primary)]">{activeScrollSeason}</b>
          </div>
        </div>

        <div className="space-y-8">
          {SESSIONS_INTRO.map((sess) => {
            const isCompleted = progress.completedLevels.includes(sess.id);
            const isUnlocked =
              sess.id === 1 || progress.completedLevels.includes(sess.id - 1);
            const levelData = T.levels.find((l) => l.id === sess.id);
            const loc = levelData?.location;

            return (
              <section
                key={sess.id}
                ref={(el) => {
                  sessionRefs.current[sess.season] = el;
                }}
                data-season-section={sess.season}
                className={`card-panel transition-all duration-500 space-y-4 border-2 ${
                  activeScrollSeason === sess.season
                    ? 'border-[var(--primary)] shadow-xl ring-2 ring-[var(--primary)]/30 scale-[1.01]'
                    : 'border-[var(--line)]'
                }`}
              >
                {/* Session Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 bg-[var(--panel)] rounded-xl border border-[var(--line)] shadow-xs">
                      {sess.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="chip py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider">
                          {sess.seasonName} · Étape {sess.id}
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          {sess.weather}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-[var(--text)] mt-1">
                        {sess.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="chip text-xs font-bold text-[var(--ok)] border-[var(--ok)]">
                        ✓ Validée
                      </span>
                    ) : isUnlocked ? (
                      <span className="chip on text-xs font-bold">
                        Accessible
                      </span>
                    ) : (
                      <span className="chip text-xs text-[var(--muted)] opacity-60">
                        🔒 Verrouillée
                      </span>
                    )}
                  </div>
                </div>

                {/* 📍 FICHE TOPO & INFOS GÉNÉRALES DU LIEU */}
                {loc && (
                  <div className="rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--panel)_88%,var(--bg))] p-4 space-y-3.5">
                    {/* Header Spot */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{loc.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[var(--text)] tracking-tight">
                              {loc.spotName}
                            </span>
                            <span className="chip py-0.5 px-2 text-[10px] font-bold">
                              {loc.country}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--muted)] block font-medium">
                            {loc.region}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="score-pill text-[11px]" title="Plage d'altitude">
                          <span>▲</span>
                          <span>{loc.altitudeRange}</span>
                        </span>
                        <span className="chip py-1 px-2.5 text-[11px] font-bold">
                          📏 {loc.trailDistance}
                        </span>
                      </div>
                    </div>

                    {/* 3 General Info Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-[var(--panel)] border border-[var(--line)] space-y-0.5">
                        <span className="font-extrabold text-[var(--primary)] block text-[10px] uppercase tracking-wider">
                          🌤️ Météo & Climat
                        </span>
                        <span className="text-[var(--text)] text-[11px] leading-relaxed block font-medium">
                          {loc.climate}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[var(--panel)] border border-[var(--line)] space-y-0.5">
                        <span className="font-extrabold text-[var(--primary)] block text-[10px] uppercase tracking-wider">
                          🌲 Relief & Nature du Sol
                        </span>
                        <span className="text-[var(--text)] text-[11px] leading-relaxed block font-medium">
                          {loc.terrainType}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[var(--panel)] border border-[var(--line)] space-y-0.5">
                        <span className="font-extrabold text-[var(--ko)] block text-[10px] uppercase tracking-wider">
                          ⚠️ Alerte Danger Terrain
                        </span>
                        <span className="text-[var(--text)] text-[11px] leading-relaxed block font-medium">
                          {loc.dangerAlert}
                        </span>
                      </div>
                    </div>

                    {/* Hiker Context & Deep Convolution Link */}
                    <div className="space-y-2 text-xs pt-1">
                      <p className="text-[var(--muted)] leading-relaxed">
                        <strong className="text-[var(--text)]">🥾 Contexte du randonneur :</strong>{' '}
                        {loc.hikerContext}
                      </p>

                      <div className="p-3 rounded-lg border border-[var(--primary)]/35 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] space-y-1">
                        <strong className="text-[var(--primary)] block font-black uppercase text-[11px] tracking-wide">
                          💡 Pourquoi la convolution sauve la randonnée ici ?
                        </strong>
                        <p className="text-[var(--text)] text-xs leading-relaxed">
                          {loc.convolutionRole}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Gear Checklist */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--line)] text-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                        🎒 Matériel de terrain :
                      </span>
                      {loc.gearList.map((gearItem, gIdx) => (
                        <span key={gIdx} className="chip py-0.5 px-2 text-[10px] font-semibold">
                          ✓ {gearItem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Problem & Convolution Solution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-1">
                  {/* Left: The Hiker's Real-Life Problem */}
                  <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--ko)] flex items-center gap-1.5 mb-1">
                        <span>⚠️</span>
                        <span>Le casse-tête du randonneur :</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text)] leading-snug">
                        {sess.hikingProblem}
                      </p>
                    </div>
                    <div className="pt-2 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--line)]">
                      {sess.practicalTakeaway}
                    </div>
                  </div>

                  {/* Right: The Convolution Mathematical Solution */}
                  <div className="p-4 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5 mb-1">
                        <span>💡</span>
                        <span>La solution par convolution :</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                        {sess.convolutionSolution}
                      </p>
                    </div>
                    <div className="pt-2 text-xs font-bold text-[var(--primary)] border-t border-[var(--line)]">
                      ✓ Résultat : Le profil altimétrique et le sentier sont sécurisés.
                    </div>
                  </div>
                </div>

                {/* Direct Action Button to start session */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)]">
                  <span className="text-xs font-mono text-[var(--muted)]">
                    Récompense d'étape : +300 m D+ & Déblocage fiche de terrain
                  </span>

                  <button
                    type="button"
                    onClick={() => isUnlocked && onStart(sess.id)}
                    disabled={!isUnlocked}
                    className="btn-adventure text-xs font-bold py-2.5 px-5 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isUnlocked ? `Démarrer l'étape (${sess.seasonName}) →` : '🔒 Terminez l\'étape précédente'}</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Final Grand Challenge Banner (Exam) */}
      <div className="card-panel border-2 border-[var(--secondary)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎒</span>
            <div>
              <span className="chip py-0.5 px-2 text-[10px] font-bold">
                Épreuve Finale · Le Sommet
              </span>
              <h3 className="text-lg font-black text-[var(--text)] mt-0.5">
                Le Grand Défi du Guide (Examen sur 100 points)
              </h3>
              <p className="text-xs text-[var(--muted)]">
                10 questions concrètes de terrain récapitulant les 4 saisons avec bilan diagnostique personnalisé.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStart(5)}
            className="btn-adventure text-xs font-bold py-2.5 px-5 cursor-pointer"
          >
            Tenter l'Examen 100 pts 🏆
          </button>
        </div>
      </div>

      {/* Hiker Progression Statistics Panel */}
      <div className="card-panel space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          Votre carnet d'expédition (Statistiques réelles)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] border border-[var(--line)] space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">
              {T.gamification.dPlus}
            </span>
            <div className="text-2xl font-black text-[var(--text)] font-mono">
              {progress.elevationGainMeters}{' '}
              <span className="text-xs font-normal text-[var(--muted)]">m D+</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] border border-[var(--line)] space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">
              {T.gamification.rank}
            </span>
            <div className="text-sm font-bold text-[var(--primary)]">{rankInfo.badge}</div>
          </div>

          <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] border border-[var(--line)] space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">Zones conquises</span>
            <div className="text-2xl font-black text-[var(--ok)] font-mono">
              {progress.completedLevels.length} / 5
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] border border-[var(--line)] space-y-1">
            <span className="text-xs text-[var(--muted)] font-medium">Fiches de terrain</span>
            <div className="text-2xl font-black text-[var(--primary)] font-mono">
              {progress.unlockedNotebooks.length} / {T.notebook.length}
            </div>
          </div>
        </div>
      </div>

      {/* Mascot Guidance */}
      <HikerMascot
        message="« En montagne, chaque saison transforme le terrain : sous les cerisiers nous lisons les altitudes, sur la plage nous lissons les parasites GPS marins, en forêt d'automne nous équilibrons les poids pour éviter la saturation, et sur la neige en ski nous calculons les falaises avec Sobel. Prêt pour l'ascension ? Choisissez votre session ou commencez par le Printemps ! »"
        size="md"
      />
    </div>
  );
}
