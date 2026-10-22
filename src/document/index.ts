// Point d'entrée « document » : Documents : one-pager et documents paginés. Squelette.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'document', statut: 'squelette' } as const;

export type Etage = typeof etage;
