// Éléments de mise en page des pages de documentation. Ils ne portent aucune valeur : tout vient
// de docs.css (qui lit les variables) et des valeurs brutes de la marque active.
import type { ReactNode } from 'react';
import { demo } from '../../src/brands/demo/index';
import { neutral } from '../../src/tokens/index';
import type { BrandValues, TokenValue } from '../../src/tokens/types';

export const activeBrand = (): string => (typeof document === 'undefined' ? 'neutral' : (document.documentElement.dataset.brand ?? 'neutral'));
export const activeValues = (): BrandValues => (activeBrand() === 'demo' ? demo : neutral);
export const isDark = (): boolean => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';

/** Valeur brute d'un jeton pour la marque et le thème actifs. */
export function rawValue(id: string): TokenValue | undefined {
  const v = activeValues();
  return (isDark() ? v.dark : v.light)[id];
}

export const show = (v: TokenValue | undefined): string => (v === undefined ? '' : Array.isArray(v) ? v.join(', ') : String(v));

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="doc">
      <h1>{title}</h1>
      {children}
    </main>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="doc__section">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export function Swatch({ cssVar, label, value }: { cssVar: string; label: string; value?: string }) {
  return (
    <div className="swatch">
      <div className="swatch__chip" style={{ background: `var(${cssVar})` }} />
      <span className="swatch__name">{label}</span>
      {value ? <span className="swatch__value">{value}</span> : null}
    </div>
  );
}

export function Table({ head, rows, label = 'Tableau' }: { head: string[]; rows: ReactNode[][]; label?: string }) {
  return (
    // Région défilable : atteignable au clavier et nommée (axe, scrollable-region-focusable).
    <div className="doc__scroll" tabIndex={0} role="region" aria-label={label}>
      <table className="doc__table">
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
