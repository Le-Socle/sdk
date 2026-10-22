// Mise en scène des stories de composants : le même composant sur fond clair puis sur surface
// sombre, dans les deux densités. Chaque cellule pose ses propres attributs (data-surface,
// data-density) : les composants lisent les mêmes rôles, seuls les jetons bougent.
import type { ReactNode } from 'react';
import { MessagesProvider } from '../../src/ui/messages';

type Cell = { surface: 'light' | 'dark'; density: 'compact' | 'comfortable' };
const CELLS: Cell[] = [
  { surface: 'light', density: 'compact' },
  { surface: 'light', density: 'comfortable' },
  { surface: 'dark', density: 'compact' },
  { surface: 'dark', density: 'comfortable' },
];
const CELL_NAME: Record<string, string> = {
  'light-compact': 'Fond clair, densité compacte',
  'light-comfortable': 'Fond clair, densité confortable',
  'dark-compact': 'Surface sombre, densité compacte',
  'dark-comfortable': 'Surface sombre, densité confortable',
};

/** Les quatre cellules : fond clair et surface sombre × densité compacte et confortable. */
export function Matrix({ children, cols = 2 }: { children: ReactNode | ((cell: Cell) => ReactNode); cols?: 1 | 2 }) {
  // Thème sombre complet (barre d'outils) : tout est déjà sombre, une surface sombre posée dedans
  // n'a rien à remapper. Les quatre cellules gardent leurs densités et perdent l'attribut de surface.
  const fullDark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
  return (
    <div className={cols === 1 ? 'mx mx--1' : 'mx'}>
      {CELLS.map((c) => (
        <section
          key={`${c.surface}-${c.density}`}
          className="mx__cell"
          data-surface={c.surface === 'dark' && !fullDark ? 'dark' : undefined}
          data-density={c.density === 'comfortable' ? 'comfortable' : undefined}
          data-cell={`${c.surface}-${c.density}`}
          aria-label={CELL_NAME[`${c.surface}-${c.density}`]}
        >
          <h3 className="mx__title">{fullDark ? `Thème sombre complet, densité ${c.density === 'comfortable' ? 'confortable' : 'compacte'}` : CELL_NAME[`${c.surface}-${c.density}`]}</h3>
          <div className="mx__body">{typeof children === 'function' ? children(c) : children}</div>
        </section>
      ))}
    </div>
  );
}

/** Une seule cellule, sur le fond de la barre d'outils (clair ou sombre complet). */
export function Single({ children }: { children: ReactNode }) {
  return <div className="mx__single">{children}</div>;
}

export function Row({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="mx__row">
      {label ? <span className="mx__label">{label}</span> : null}
      <div className="mx__items">{children}</div>
    </div>
  );
}

export { MessagesProvider };
