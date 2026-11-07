import React, { useState, useMemo, useEffect } from 'react';
import { T } from '@/data/texts';
import AdventureMap, { type MapZone } from '@/components/AdventureMap';
import CarnetModal from '@/components/CarnetModal';
import HomeHero from '@/components/HomeHero';

import Level1 from '@/features/level1/Level1';
import Level3 from '@/features/level3/Level3';
import Level4 from '@/features/level4/Level4';
import Level6 from '@/features/level6/Level6';
import Level11 from '@/features/level11/Level11';

import {
  loadProgress,
  resetProgress,
  grantLevelReward,
  type TrailKernelProgress,
} from '@/core/storage';

const ELEVATION_PER_LEVEL = 300;

export default function App(): React.JSX.Element {
  const [progress, setProgress] = useState<TrailKernelProgress>(() => loadProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [view, setView] = useState<'home' | 'trail'>('home');
  const [isCarnetOpen, setIsCarnetOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [homeSeason, setHomeSeason] = useState('spring');

  // Theme management (light / dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trailkernel_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trailkernel_theme', next);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  // Sync active season attribute to root for atmospheric background
  const currentLevelData = T.levels.find((lvl) => lvl.id === currentLevelId);
  const activeSeason = view === 'home' ? homeSeason : (currentLevelData?.season ?? 'spring');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.season = activeSeason;
    }
  }, [activeSeason]);

  // Sync state if initial storage loads
  useEffect(() => {
    if (progress.lastActiveLevel && progress.lastActiveLevel >= 1 && progress.lastActiveLevel <= T.levels.length) {
      setCurrentLevelId(progress.lastActiveLevel);
    }
  }, [progress.lastActiveLevel]);

  const handleLevelComplete = (id: number) => {
    setProgress((prev) => grantLevelReward(prev, id, ELEVATION_PER_LEVEL));
  };

  const handleStartFromHome = (targetLevelId: number) => {
    const validId = Math.min(Math.max(1, targetLevelId), T.levels.length);
    setCurrentLevelId(validId);
    setView('trail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    const fresh = resetProgress();
    setProgress(fresh);
    setCurrentLevelId(1);
    setView('home');
    setShowResetConfirm(false);
  };

  const zones: MapZone[] = useMemo(() => {
    return T.levels.map((lvl, index) => {
      const isComplete = progress.completedLevels.includes(lvl.id);
      const isUnlocked = index === 0 || progress.completedLevels.includes(T.levels[index - 1]?.id ?? 0);
      return {
        id: lvl.id,
        title: lvl.title,
        subtitle: lvl.subtitle,
        season: lvl.season,
        weather: lvl.weather,
        difficulty: lvl.difficulty,
        complete: isComplete,
        unlocked: isUnlocked,
      };
    });
  }, [progress.completedLevels]);

  const isCurrentComplete = progress.completedLevels.includes(currentLevelId);
  const nextLevelId = currentLevelId + 1;
  const canGoNext =
    nextLevelId <= T.levels.length &&
    (isCurrentComplete || zones.find((s) => s.id === nextLevelId)?.unlocked === true);

  return (
    <div className="min-h-screen flex flex-col text-[var(--text)] transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_srgb,var(--panel)_88%,transparent)] border-b border-[var(--line)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-2xl hover:scale-110 transition-transform cursor-pointer"
              aria-label="Accueil"
            >
              🥾
            </button>
            <button
              type="button"
              onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="app-logo text-left cursor-pointer group"
            >
              <span>Trail</span><b>Kernel</b>
            </button>
          </div>

          {/* TOP BUTTONS: HIDDEN on main menu (home), BROUGHT BACK when entering the adventure (trail) */}
          {view === 'trail' ? (
            <>
              {/* Pill Navigation across stages */}
              <nav aria-label="Zones de l'expédition" className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="chip text-xs py-1.5 px-3 font-semibold"
                >
                  ← Menu Principal
                </button>

                {zones.map((zone) => {
                  const isSelected = currentLevelId === zone.id;
                  const isDone = zone.complete;
                  const isLocked = !zone.unlocked;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        if (!isLocked) {
                          setCurrentLevelId(zone.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={isLocked}
                      className={`${isSelected ? 'on' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'lk' : ''}`}
                      title={isLocked ? "Réussissez la zone précédente pour débloquer" : zone.title}
                    >
                      <span>{zone.title.split(' ')[0]}</span>
                      <span className="hidden sm:inline">{zone.title.replace(/^[^\w]*/, '')}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Gamification Bar & Action Chips */}
              <div className="flex items-center gap-2">
                <span className="score-pill" title="Dénivelé positif accumulé (XP)">
                  <span>▲</span>
                  <span>{progress.elevationGainMeters} m D+</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsCarnetOpen(true)}
                  className="chip"
                  aria-label="Ouvrir le carnet de terrain"
                >
                  <span>📓</span>
                  <span className="hidden md:inline">Carnet</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="ic"
                  aria-label="Changer de thème (Bivouac / Plein jour)"
                  title="Changer de thème (Bivouac / Plein jour)"
                >
                  ◐
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="ic"
                  title="Réinitialiser l'ascension"
                  aria-label="Réinitialiser l'ascension"
                >
                  🔄
                </button>
              </div>
            </>
          ) : (
            /* On the main menu: NO top navigation buttons, only theme toggle */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="ic"
                aria-label="Changer de thème (Bivouac / Plein jour)"
                title="Changer de thème (Bivouac / Plein jour)"
              >
                ◐
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        {/* Onboarding Guide Box (collapsible in trail mode) */}
        {showHowToPlay && view === 'trail' && (
          <div className="mb-6 card-panel space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="chip on text-xs font-bold uppercase tracking-wider">
                {T.howToPlay.badge}
              </span>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] font-semibold px-2 py-0.5 rounded cursor-pointer"
                title="Masquer le guide"
              >
                ✕ Masquer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] rounded-xl border border-[var(--line)] space-y-1">
                <p className="font-bold text-[var(--text)]">{T.howToPlay.step1Title}</p>
                <p className="text-[var(--muted)] leading-relaxed">{T.howToPlay.step1Desc}</p>
              </div>

              <div className="p-3 bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] rounded-xl border border-[var(--line)] space-y-1">
                <p className="font-bold text-[var(--text)]">{T.howToPlay.step2Title}</p>
                <p className="text-[var(--muted)] leading-relaxed">{T.howToPlay.step2Desc}</p>
              </div>

              <div className="p-3 bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] rounded-xl border border-[var(--line)] space-y-1">
                <p className="font-bold text-[var(--text)]">{T.howToPlay.step3Title}</p>
                <p className="text-[var(--muted)] leading-relaxed">{T.howToPlay.step3Desc}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'home' ? (
          <HomeHero
            progress={progress}
            onStart={handleStartFromHome}
            onOpenNotebook={() => setIsCarnetOpen(true)}
            onSeasonChange={(s) => setHomeSeason(s)}
          />
        ) : (
          <div className="space-y-6">
            {/* Visual Adventure Map Bar */}
            <div className="card-panel p-2 sm:p-4">
              <AdventureMap
                zones={zones}
                currentId={currentLevelId}
                onSelect={(id) => {
                  setCurrentLevelId(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>

            {currentLevelData && (
              <section className="card-panel space-y-6">
                {/* Level header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--line)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="chip on text-xs font-bold uppercase tracking-wider">
                        Étape {currentLevelData.id} / {T.levels.length} — {currentLevelData.difficulty}
                      </span>
                      <span className="score-pill text-xs">
                        +{ELEVATION_PER_LEVEL} m D+
                      </span>
                      <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--bg)] px-2.5 py-1 rounded-full border border-[var(--line)]">
                        {currentLevelData.weather}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)] pt-1">
                      {currentLevelData.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted)] font-medium">
                      {currentLevelData.objective}
                    </p>

                    {/* 📍 Fiche Topo & Infos Générales du Spot de Randonnée */}
                    {'location' in currentLevelData && (currentLevelData as any).location && (
                      <div className="rounded-xl border border-[var(--primary)]/30 bg-[color-mix(in_srgb,var(--panel)_92%,var(--bg))] p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{(currentLevelData as any).location.flag}</span>
                            <div>
                              <span className="text-xs font-black text-[var(--text)] tracking-tight block">
                                📍 {(currentLevelData as any).location.spotName}
                              </span>
                              <span className="text-[11px] text-[var(--muted)] block">
                                {(currentLevelData as any).location.region} · {(currentLevelData as any).location.country}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="score-pill text-[10px]">
                              ▲ {(currentLevelData as any).location.altitudeRange}
                            </span>
                            <span className="chip py-0.5 px-2 text-[10px] font-bold">
                              📏 {(currentLevelData as any).location.trailDistance}
                            </span>
                          </div>
                        </div>

                        {/* 3 Topo Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                            <span className="text-[10px] font-extrabold text-[var(--primary)] block uppercase">
                              🌤️ Climat
                            </span>
                            <span className="text-[var(--text)]">{(currentLevelData as any).location.climate}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                            <span className="text-[10px] font-extrabold text-[var(--primary)] block uppercase">
                              🌲 Terrain
                            </span>
                            <span className="text-[var(--text)]">{(currentLevelData as any).location.terrainType}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                            <span className="text-[10px] font-extrabold text-[var(--ko)] block uppercase">
                              ⚠️ Danger
                            </span>
                            <span className="text-[var(--text)]">{(currentLevelData as any).location.dangerAlert}</span>
                          </div>
                        </div>

                        {/* Practical link between this location and convolution */}
                        <div className="p-2.5 rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border border-[var(--primary)]/20 text-xs">
                          <strong className="text-[var(--primary)]">💡 Clé convolutive du spot : </strong>
                          <span className="text-[var(--text)]">{(currentLevelData as any).location.convolutionRole}</span>
                        </div>
                      </div>
                    )}

                    {/* Practical Hiker Scenario Callout */}
                    {'hikingProblem' in currentLevelData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                        <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)]">
                          <span className="font-bold text-[var(--ko)] block mb-0.5">⚠️ Casse-tête du randonneur :</span>
                          <span className="text-[var(--text)]">{(currentLevelData as any).hikingProblem}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_60%,transparent)]">
                          <span className="font-bold text-[var(--primary)] block mb-0.5">💡 Réflexe de terrain :</span>
                          <span className="text-[var(--text)]">{(currentLevelData as any).practicalTakeaway}</span>
                        </div>
                      </div>
                    )}

                    {/* Explicit Mission Instruction */}
                    <div className="tip-banner flex items-center gap-2 font-bold">
                      <span>👉</span>
                      <span>{currentLevelData.instructions}</span>
                    </div>
                  </div>

                  {isCurrentComplete && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--ok)_15%,transparent)] border border-[var(--ok)] text-[var(--ok)] text-xs font-bold">
                      <span>✓</span>
                      <span>{T.level.complete}</span>
                    </div>
                  )}
                </div>

                {/* Success celebration banner */}
                {isCurrentComplete && currentLevelData.successMessage && (
                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--ok)_15%,transparent)] border border-[var(--ok)] p-4 text-xs sm:text-sm font-medium text-[var(--ok)] flex items-center gap-2.5">
                    <span className="text-2xl shrink-0" role="img" aria-hidden="true">
                      🎉
                    </span>
                    <div>
                      <strong>{T.level.success}</strong> {currentLevelData.successMessage}
                    </div>
                  </div>
                )}

                {/* Active Level Feature Component */}
                <div className="py-2">
                  {currentLevelId === 1 && (
                    <Level1 onComplete={() => handleLevelComplete(1)} />
                  )}
                  {currentLevelId === 2 && (
                    <Level3 onComplete={() => handleLevelComplete(2)} />
                  )}
                  {currentLevelId === 3 && (
                    <Level4 onComplete={() => handleLevelComplete(3)} />
                  )}
                  {currentLevelId === 4 && (
                    <Level6 onComplete={() => handleLevelComplete(4)} />
                  )}
                  {currentLevelId === 5 && (
                    <Level11
                      onComplete={() => handleLevelComplete(5)}
                      onNavigateLevel={(id) => setCurrentLevelId(id)}
                    />
                  )}
                </div>

                {/* Next Level navigation button */}
                {isCurrentComplete && canGoNext && (
                  <div className="pt-4 border-t border-[var(--line)] flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentLevelId(nextLevelId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-adventure flex items-center gap-2 text-sm"
                    >
                      <span>Zone suivante : {T.levels[currentLevelId]?.title ?? ''} →</span>
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 text-xs text-[var(--muted)] border-t border-[var(--line)] bg-[var(--panel)] transition-colors">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>TrailKernel — La convolution expliquée par les 4 saisons de la randonnée 🌸☀️🍂❄️</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCarnetOpen(true)}
              className="text-[var(--text)] hover:underline cursor-pointer"
            >
              Fiches de terrain
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-[var(--text)] hover:underline cursor-pointer"
            >
              Menu Principal
            </button>
          </div>
        </div>
      </footer>

      {/* Carnet de Rando Modal */}
      <CarnetModal
        isOpen={isCarnetOpen}
        onClose={() => setIsCarnetOpen(false)}
        unlockedLevelIds={progress.unlockedNotebooks}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="card-panel max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[var(--text)]">
              Réinitialiser l'ascension ?
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Toutes les zones conquises, le dénivelé accumulé et les fiches débloquées seront remis à zéro.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="chip"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--ko)] text-white hover:opacity-90 cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
