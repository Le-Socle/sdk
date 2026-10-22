// Point d'entrée « tokens » : valeurs brutes de la marque neutre, pour tout ce qui ne lit pas
// une variable CSS (e-mails, PowerPoint, graphiques). Une marque exporte la même forme
// (voir @le-socle/sdk/brands/demo et la page « Créer une marque »).
import { comfortable, dark, light, surfaceDark, surfaceDarker, fonts, types } from './generated/neutral';
import type { BrandValues } from './types';

export type { BrandValues, FontDeclaration, TokenValue, TokenValues } from './types';
export { types as tokenTypes };

/** Thème neutre du SDK : tout fonctionne sans marque. */
export const neutral: BrandValues = { id: 'neutral', light, dark, surfaceDark, surfaceDarker, comfortable, fonts };

/** Valeur brute d'un jeton (identifiant DTCG, par exemple `role.color.action.base`). */
export function raw(brand: BrandValues, id: string, mode: 'light' | 'dark' = 'light'): string | number | readonly number[] | readonly string[] {
  const v = brand[mode][id];
  if (v === undefined) throw new Error(`Jeton inconnu : ${id}`);
  return v;
}
