/**
 * Design tokens for TrailKernel outdoor mountain theme.
 */

export const COLORS = {
  forest: {
    50: '#f0f7ee',
    100: '#d8ecd1',
    200: '#b2d9a2',
    300: '#7dbe6a',
    400: '#4fa34a',
    500: '#2d7d32',
    600: '#1b5e20',
    700: '#114219',
    800: '#0a2e11',
    900: '#051a09',
  },
  rock: {
    50: '#f5f5f4',
    100: '#e7e5e4',
    200: '#d6d3d1',
    300: '#a8a29e',
    400: '#78716c',
    500: '#57534e',
    600: '#44403c',
    700: '#292524',
    800: '#1c1917',
    900: '#0c0a09',
  },
  snow: '#ffffff',
  sunset: {
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const SHADOW = {
  card: '0 2px 8px rgba(0,0,0,0.12)',
  raised: '0 4px 20px rgba(0,0,0,0.18)',
} as const;

export const FONT = {
  mono: "'JetBrains Mono', monospace",
  sans: "'Bricolage Grotesque', system-ui, -apple-system, sans-serif",
} as const;
