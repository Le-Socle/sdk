// Point d'entrée « render » : Rendu : export PDF, image, PowerPoint. Squelette, navigateur de rendu en dépendance optionnelle.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'render', statut: 'squelette' } as const;

export type Etage = typeof etage;
