// Index des jetons du thème neutre, généré par `npm run tokens` (generated/tokens-index.json).
// Les pages lisent cette liste et les variables CSS : aucune valeur n'est recopiée dans une page.
import index from '../../generated/tokens-index.json';

export interface TokenRow {
  id: string;
  css: string;
  layer: 'value' | 'role' | 'component';
  type: string;
  description: string;
  alias: string | null;
  light: string | number | number[] | string[];
  dark: string | number | number[] | string[] | null;
}

export const tokens = index as TokenRow[];
export const withPrefix = (prefix: string) => tokens.filter((t) => t.id.startsWith(prefix));
export const byCss = (name: string) => tokens.find((t) => t.css === name);
