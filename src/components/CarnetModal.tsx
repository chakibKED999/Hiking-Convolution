import React, { useState } from 'react';
import { T } from '@/data/texts';

interface CarnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevelIds: number[];
}

/**
 * CarnetModal — Alpine and space applications of image convolution.
 * Displays location field sheets and industrial use cases unlocked as the hiker clears each expedition stage.
 */
export default function CarnetModal({
  isOpen,
  onClose,
  unlockedLevelIds,
}: CarnetModalProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'spots' | 'tech'>('spots');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carnet-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--panel)] text-[var(--text)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[color-mix(in_srgb,var(--bg)_50%,transparent)] border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">
              📓
            </span>
            <div>
              <h2
                id="carnet-title"
                className="text-lg font-black tracking-tight text-[var(--text)]"
              >
                {T.nav.notebook}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Fiches d'expédition des 4 saisons & Applications concrètes de la convolution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ic"
            aria-label="Fermer le carnet"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--line)] bg-[var(--panel)] px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('spots')}
            className={`py-2 px-3 font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'spots'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>📍</span>
            <span>Spots & Expéditions (4 Saisons)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`py-2 px-3 font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tech'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>🛰️</span>
            <span>Applications & Métiers Alpins</span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'spots' ? (
            <div className="space-y-4">
              <div className="tip-banner text-xs">
                <strong>Fiches de terrain débloquées :</strong> {unlockedLevelIds.length} /{' '}
                {T.levels.length}. Explorez les caractéristiques géographiques réelles de chaque spot et l'utilité vitale de la convolution sur place !
              </div>

              <div className="grid grid-cols-1 gap-4">
                {T.levels.map((lvl) => {
                  const isUnlocked = unlockedLevelIds.includes(lvl.id);
                  const loc = lvl.location;

                  return (
                    <div
                      key={lvl.id}
                      className={`rounded-xl border p-4 transition-all space-y-3 ${
                        isUnlocked
                          ? 'bg-[var(--panel)] border-[var(--line)] shadow-xs'
                          : 'bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] border-[var(--line)] opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{isUnlocked ? loc.flag : '🔒'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-[var(--text)]">
                                {isUnlocked ? loc.spotName : `Spot ${lvl.id} verrouillé`}
                              </h3>
                              {isUnlocked && (
                                <span className="chip py-0.5 px-2 text-[10px] font-bold">
                                  {loc.country}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[var(--muted)]">
                              {isUnlocked ? `${loc.region} · Étape ${lvl.id}` : 'Atteignez cette étape pour révéler le spot'}
                            </span>
                          </div>
                        </div>

                        {isUnlocked && (
                          <div className="flex items-center gap-1.5">
                            <span className="score-pill text-[10px]">▲ {loc.altitudeRange}</span>
                            <span className="chip py-0.5 px-2 text-[10px] font-bold">📏 {loc.trailDistance}</span>
                          </div>
                        )}
                      </div>

                      {isUnlocked ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded bg-[var(--bg)] border border-[var(--line)]">
                              <span className="text-[10px] font-bold text-[var(--primary)] block uppercase">Météo & Climat</span>
                              <span className="text-[var(--text)] text-[11px]">{loc.climate}</span>
                            </div>
                            <div className="p-2 rounded bg-[var(--bg)] border border-[var(--line)]">
                              <span className="text-[10px] font-bold text-[var(--primary)] block uppercase">Nature du Sol</span>
                              <span className="text-[var(--text)] text-[11px]">{loc.terrainType}</span>
                            </div>
                            <div className="p-2 rounded bg-[var(--bg)] border border-[var(--line)]">
                              <span className="text-[10px] font-bold text-[var(--ko)] block uppercase">Alerte Danger</span>
                              <span className="text-[var(--text)] text-[11px]">{loc.dangerAlert}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="text-[var(--muted)] leading-relaxed">
                              <strong className="text-[var(--text)]">🥾 Contexte :</strong> {loc.hikerContext}
                            </p>
                            <div className="p-2 rounded bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border border-[var(--primary)]/20 text-xs">
                              <strong className="text-[var(--primary)]">💡 Solution Convolutive :</strong>{' '}
                              <span className="text-[var(--text)]">{loc.convolutionRole}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                            <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Matériel :</span>
                            {loc.gearList.map((g, gi) => (
                              <span key={gi} className="chip py-0.5 px-2 text-[10px]">
                                🎒 {g}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-[var(--muted)] italic">
                          Terminez les étapes précédentes pour débloquer la fiche de reconnaissance de ce site.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="tip-banner text-xs">
                <strong>Applications industrielles débloquées :</strong> {unlockedLevelIds.length} /{' '}
                {T.notebook.length}. Cas d'usages concrets de la convolution en télédétection et secours en montagne.
              </div>

              <div className="grid grid-cols-1 gap-3">
                {T.notebook.map((entry) => {
                  const isUnlocked = unlockedLevelIds.includes(entry.levelId);

                  return (
                    <div
                      key={entry.levelId}
                      className={`rounded-xl border p-4 transition-all ${
                        isUnlocked
                          ? 'bg-[var(--panel)] border-[var(--line)] shadow-xs'
                          : 'bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] border-[var(--line)] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className="text-2xl shrink-0 p-2.5 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] rounded-xl border border-[var(--line)]"
                          role="img"
                          aria-hidden="true"
                        >
                          {isUnlocked ? entry.icon : '🔒'}
                        </span>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="chip py-0.5 px-2 text-[10px] font-bold">
                              {entry.category} (Étape {entry.levelId})
                            </span>
                            {!isUnlocked && (
                              <span className="text-[11px] font-semibold text-[var(--muted)]">
                                Conquérez la zone {entry.levelId}
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-sm text-[var(--text)]">
                            {isUnlocked ? entry.title : 'Fiche confidentielle verrouillée'}
                          </h3>
                          <p className="text-xs text-[var(--muted)] leading-relaxed">
                            {isUnlocked
                              ? entry.application
                              : 'Progressez le long de l’expédition météo pour révéler cette application industrielle.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[color-mix(in_srgb,var(--bg)_50%,transparent)] border-t border-[var(--line)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="chip on text-xs font-bold cursor-pointer"
          >
            Fermer le carnet
          </button>
        </div>
      </div>
    </div>
  );
}
