// Point d'entrée « app » : Applications : coque, tableau de données, filtres, fiche. Le moteur d'écrans par métadonnées viendra ici.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md).

/** Marque de présence du point d'entrée tant qu'il n'exporte pas de pièce. */
export const etage = { support: 'app', statut: 'actif' } as const;

export type Etage = typeof etage;
