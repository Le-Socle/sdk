// Point d'entrée « ui » : composants d'interface génériques (étage 2).
// Les 28 primitives arrivent au lot 2 ; l'utilitaire de classes sert déjà.
export { cn } from '../lib/cn';
export const etage = { support: 'ui', statut: 'actif' } as const;
export type Etage = typeof etage;
