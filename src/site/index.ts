// Point d'entrée « site » : Site : sections et gabarit de site. Squelette, rempli au lot 3.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'site', statut: 'squelette' } as const;

export type Etage = typeof etage;
