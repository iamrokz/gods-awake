export const COLORS = {
  black: '#0a0a0c',
  dark: '#141418',
  mid: '#2a2e36',
  light: '#c8c4be',
  white: '#e8e6e3',
  red: '#bc1e22',
  redSoft: '#e04548',
  anima: '#e8e6e3',
  animaAccent: '#bc1e22',
  animus: '#1a2a44',
  animusAccent: '#3a7ab8',
  animusGlow: '#5eb0ff',
  gold: '#c9a227',
  heart: '#bc1e22',
  ui: '#e8e6e3',
};

export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
