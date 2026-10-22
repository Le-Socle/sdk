// Point d'entrée « slides » : Présentations : format de slide et types de slides. Squelette.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'slides', statut: 'squelette' } as const;

export type Etage = typeof etage;
