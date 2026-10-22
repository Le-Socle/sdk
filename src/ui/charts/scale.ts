import * as React from 'react';

/**
 * Échelle de données à paliers. La marque fixe le nombre de paliers (4 ou 6) et leurs seuils dans
 * ses jetons (`--data-count`, `--data-threshold-N`) ; les graphiques lisent « palier N » et ne
 * savent pas combien il y en a. Passer de 4 à 6 paliers ne change donc aucun graphique.
 *
 * Palier 1 = le plus favorable. Une valeur va de 0 à 100 ; sous le seuil 1 elle est au palier 1,
 * entre le seuil 1 et le seuil 2 au palier 2, etc. (`higherIsBetter` inverse le sens).
 */
export type DataScale = { count: number; thresholds: number[] };

/** Échelle de repli (rendu serveur, avant lecture des jetons) : celle du thème neutre. */
export const defaultScale: DataScale = { count: 4, thresholds: [25, 50, 75] };

/** Lit l'échelle dans les variables CSS d'un élément (par défaut la racine du document). */
export function readDataScale(element?: Element): DataScale {
  if (typeof document === 'undefined') return defaultScale;
  const styles = getComputedStyle(element ?? document.documentElement);
  const count = Math.round(Number(styles.getPropertyValue('--data-count')));
  if (!Number.isFinite(count) || count < 2) return defaultScale;
  const thresholds = Array.from({ length: count - 1 }, (_, i) => Number(styles.getPropertyValue(`--data-threshold-${i + 1}`)));
  return thresholds.every(Number.isFinite) ? { count, thresholds } : defaultScale;
}

const same = (a: DataScale, b: DataScale) => a.count === b.count && a.thresholds.join() === b.thresholds.join();

/** L'échelle de la marque en vigueur ; `override` la remplace (tests, graphique figé). */
export function useDataScale(override?: DataScale): DataScale {
  const [scale, setScale] = React.useState<DataScale>(defaultScale);
  React.useLayoutEffect(() => {
    if (override) return;
    const next = readDataScale();
    setScale((prev) => (same(prev, next) ? prev : next));
  });
  return override ?? scale;
}

/** Palier (1 à count) d'une valeur de 0 à 100. */
export function tierOf(value: number, scale: DataScale, higherIsBetter = false): number {
  const v = Math.min(100, Math.max(0, higherIsBetter ? 100 - value : value));
  let tier = 1;
  for (const t of scale.thresholds.slice(0, scale.count - 1)) if (v >= t) tier += 1;
  return Math.min(tier, scale.count);
}

/** Variable CSS de la couleur d'un palier : `mark` (repère graphique), `text`, `bg`, `border`. */
export const tierVar = (tier: number, part: 'mark' | 'text' | 'bg' | 'border' = 'mark') => `var(--color-data-${tier}-${part})`;

/** Variable CSS de la couleur de la série N (1 à 6) d'un graphique. */
export const seriesVar = (n: number) => `var(--color-series-${((n - 1) % 6) + 1})`;
