// Point d'entrée « email » : E-mails : blocs et gabarits. Squelette.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'email', statut: 'squelette' } as const;

export type Etage = typeof etage;
