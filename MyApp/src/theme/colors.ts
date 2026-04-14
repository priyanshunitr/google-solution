/**
 * Design tokens — extracted from web CSS variables.
 * Replaces :root CSS custom properties with JS constants.
 */

export const Colors = {
  bg: '#0F1117',
  surface: '#1A1D27',
  surface2: '#242736',
  surface3: '#2E3142',
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  danger: '#E74C3C',
  dangerDark: '#C0392B',
  dangerGlow: 'rgba(231, 76, 60, 0.35)',
  warning: '#F39C12',
  warningGlow: 'rgba(243, 156, 18, 0.25)',
  safe: '#00B894',
  safeGlow: 'rgba(0, 184, 148, 0.3)',
  info: '#0984E3',
  text: '#F0F0F5',
  textSecondary: '#9BA0B5',
  textMuted: '#6B7085',
  border: 'rgba(255, 255, 255, 0.08)',
  glass: 'rgba(26, 29, 39, 0.85)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 32,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};
