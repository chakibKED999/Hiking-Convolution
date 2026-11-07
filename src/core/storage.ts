/**
 * Typed LocalStorage persistence for TrailKernel gamification and progress.
 * Includes schema versioning, fault-tolerant try/catch, and reset controls.
 */

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'trailkernel_progression_v1';

export type HikerRank =
  'Marcheur' | 'Randonneur' | 'Alpiniste' | 'Guide de haute montagne';

export interface TrailKernelProgress {
  version: number;
  completedLevels: number[];
  elevationGainMeters: number; // D+ in meters (XP)
  unlockedNotebooks: number[];
  examScore: number | null;
  lastActiveLevel: number;
}

export const DEFAULT_PROGRESS: TrailKernelProgress = {
  version: STORAGE_VERSION,
  completedLevels: [],
  elevationGainMeters: 0,
  unlockedNotebooks: [],
  examScore: null,
  lastActiveLevel: 1,
};

/**
 * Determine hiker rank based on accumulated positive elevation gain (D+).
 */
export function getRankFromElevation(dPlus: number): {
  rank: HikerRank;
  badge: string;
  nextThreshold: number | null;
} {
  if (dPlus >= 1200) {
    return {
      rank: 'Guide de haute montagne',
      badge: '🎖️ Guide Suprême',
      nextThreshold: null,
    };
  }
  if (dPlus >= 700) {
    return { rank: 'Alpiniste', badge: '🧗 Alpiniste Chevronné', nextThreshold: 1200 };
  }
  if (dPlus >= 300) {
    return { rank: 'Randonneur', badge: '🥾 Randonneur Aguerri', nextThreshold: 700 };
  }
  return { rank: 'Marcheur', badge: '🌲 Marcheur Initié', nextThreshold: 300 };
}

/**
 * Load progress from localStorage with fallback to default state.
 */
export function loadProgress(): TrailKernelProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PROGRESS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };

    const parsed = JSON.parse(raw) as Partial<TrailKernelProgress>;
    if (parsed.version !== STORAGE_VERSION) {
      // Future-proof migration hook if schema changes
      return { ...DEFAULT_PROGRESS };
    }

    return {
      version: STORAGE_VERSION,
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      elevationGainMeters:
        typeof parsed.elevationGainMeters === 'number' ? parsed.elevationGainMeters : 0,
      unlockedNotebooks: Array.isArray(parsed.unlockedNotebooks)
        ? parsed.unlockedNotebooks
        : [],
      examScore: typeof parsed.examScore === 'number' ? parsed.examScore : null,
      lastActiveLevel:
        typeof parsed.lastActiveLevel === 'number' ? parsed.lastActiveLevel : 1,
    };
  } catch (err) {
    // Graceful fallback on privacy-restricted storage or corrupted JSON
    console.warn('Unable to load TrailKernel progress from localStorage', err);
    return { ...DEFAULT_PROGRESS };
  }
}

/**
 * Save progress to localStorage safely.
 */
export function saveProgress(progress: TrailKernelProgress): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (err) {
    console.warn('Unable to save TrailKernel progress to localStorage', err);
    return false;
  }
}

/**
 * Reset all saved progress to initial state.
 */
export function resetProgress(): TrailKernelProgress {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return { ...DEFAULT_PROGRESS };
}

/**
 * Mark a level complete and grant elevation gain (+D meters) and unlock notebook entry.
 */
export function grantLevelReward(
  current: TrailKernelProgress,
  levelId: number,
  elevationAward: number,
): TrailKernelProgress {
  const isAlreadyCompleted = current.completedLevels.includes(levelId);
  const nextCompleted = isAlreadyCompleted
    ? current.completedLevels
    : [...current.completedLevels, levelId];

  const nextNotebooks = current.unlockedNotebooks.includes(levelId)
    ? current.unlockedNotebooks
    : [...current.unlockedNotebooks, levelId];

  const nextElevation = isAlreadyCompleted
    ? current.elevationGainMeters
    : current.elevationGainMeters + elevationAward;

  const updated: TrailKernelProgress = {
    ...current,
    completedLevels: nextCompleted,
    elevationGainMeters: nextElevation,
    unlockedNotebooks: nextNotebooks,
    lastActiveLevel: levelId,
  };

  saveProgress(updated);
  return updated;
}
