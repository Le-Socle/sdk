// Point d'entrée « social » : Réseaux : formats de visuels. Squelette.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'social', statut: 'squelette' } as const;

export type Etage = typeof etage;
