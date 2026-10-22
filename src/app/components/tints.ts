import type { Color } from '../engine/types';

/**
 * Ton d'une pastille : les quinze teintes des métadonnées se rangent dans six tons, chacun lu sur
 * les rôles de la marque (statuts et accent). Une marque change l'aspect d'un ton, jamais le
 * composant. Regrouper ainsi garde des contrastes AA vérifiés sur clair, sombre et surfaces sombres.
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

const TONE_OF: Record<Color, Tone> = {
  gray: 'neutral',
  red: 'danger',
  orange: 'warning',
  amber: 'warning',
  yellow: 'warning',
  lime: 'success',
  green: 'success',
  emerald: 'success',
  teal: 'success',
  sky: 'info',
  blue: 'info',
  indigo: 'info',
  violet: 'accent',
  purple: 'accent',
  pink: 'accent',
};

/** Pastille pleine : fond, texte et filet du ton. */
export const PILL_CLASS: Record<Tone, string> = {
  neutral: 'border-border bg-badge-bg text-badge-fg',
  info: 'border-badge-info-border bg-badge-info-bg text-badge-info-fg',
  success: 'border-badge-success-border bg-badge-success-bg text-badge-success-fg',
  warning: 'border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg',
  danger: 'border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg',
  accent: 'border-transparent bg-accent-subtle text-accent-ink',
};

/** Point de couleur : repère rond du ton. */
export const DOT_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted-foreground',
  info: 'bg-status-info',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-error',
  accent: 'bg-accent-base',
};

/** Texte coloré du ton (valeur en retard, indicateur). */
export const TEXT_CLASS: Record<Tone, string> = {
  neutral: 'text-foreground',
  info: 'text-status-info-text',
  success: 'text-status-success-text',
  warning: 'text-status-warning-text',
  danger: 'text-destructive-text',
  accent: 'text-accent-ink',
};

export function toneOf(color: unknown): Tone {
  return typeof color === 'string' && color in TONE_OF ? TONE_OF[color as Color] : 'neutral';
}

/** Ton stable dérivé d'un texte (avatars sans image). */
const CYCLE: Tone[] = ['info', 'accent', 'success', 'warning', 'neutral'];
export function toneFor(text: string): Tone {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return CYCLE[h % CYCLE.length] ?? 'neutral';
}
