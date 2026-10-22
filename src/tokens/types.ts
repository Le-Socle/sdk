/** Valeurs brutes d'un jeu de jetons : l'identifiant DTCG du jeton → sa valeur
 * (couleur en #rrggbb ou rgba(), dimension en px, durée en ms, courbe en 4 nombres,
 * ombre en texte CSS, nombre, texte). */
export type TokenValue = string | number | readonly number[] | readonly string[];
export type TokenValues = Readonly<Record<string, TokenValue>>;

/** Police déclarée par une marque : voir docs/polices.md. */
export interface FontDeclaration {
  readonly family: string;
  readonly license: string;
  readonly fallbacks: Readonly<Record<'web' | 'email' | 'powerpoint' | 'pdf', string>>;
  readonly files: readonly string[];
}

/** Un paquet de marque exporte cette forme (voir la page « Créer une marque »). */
export interface BrandValues {
  readonly id: string;
  readonly light: TokenValues;
  readonly dark: TokenValues;
  readonly surfaceDark: TokenValues;
  readonly surfaceDarker: TokenValues;
  readonly comfortable: TokenValues;
  readonly fonts?: Readonly<Record<string, FontDeclaration>>;
}
