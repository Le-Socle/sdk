'use client';

import * as React from 'react';

/**
 * Textes intégrés des composants. Chaque texte a une valeur française par défaut ; une application
 * (ou une langue) en remplace tout ou partie, une fois, avec `MessagesProvider`, ou composant par
 * composant avec la propriété correspondante. Aucun composant n'écrit de texte visible en dur.
 */
export type Messages = {
  /** Bouton qui ferme une fenêtre, un volet, une notification. */
  close: string;
  /** Nom de la zone qui défile d'une fenêtre. */
  dialogContent: string;
  /** Nom de la zone qui défile d'un volet. */
  sheetContent: string;
  /** Nom d'un tableau qui défile quand il n'a pas de légende. */
  scrollableTable: string;
  /** Marque d'un champ obligatoire. */
  required: string;
  /** Annonce vocale d'un chargement. */
  loading: string;
  /** Palette de commandes : titre, aide, liste, résultats. */
  commandTitle: string;
  commandDescription: string;
  commandLabel: string;
  commandResults: string;
  commandPlaceholder: string;
  commandEmpty: string;
  /** Région des notifications. */
  notifications: string;
  /** Pagination. */
  pagination: string;
  previous: string;
  next: string;
  page: (n: number) => string;
  morePages: string;
  /** Fil d'Ariane. */
  breadcrumb: string;
  morePath: string;
  /** Barre latérale. */
  sidebar: string;
  toggleSidebar: string;
  /** Avatar sans image. */
  avatar: string;
  /** Graphiques et données. */
  locale: string;
  /** Palier de l'échelle : lu (« Palier 2 sur 4 »). */
  tier: (n: number, count: number) => string;
  /** Palier de l'échelle : affiché (« Palier 2 »). */
  tierShort: (n: number) => string;
  noData: string;
  notRated: string;
  chartTable: string;
  chartValue: string;
  chartCategory: string;
};

export const messagesFr: Messages = {
  close: 'Fermer',
  dialogContent: 'Contenu de la fenêtre',
  sheetContent: 'Contenu du volet',
  scrollableTable: 'Tableau défilant',
  required: '(obligatoire)',
  loading: 'Chargement en cours',
  commandTitle: 'Palette de commandes',
  commandDescription: 'Tapez pour chercher une page, un compte ou une action, puis Entrée pour l’ouvrir.',
  commandLabel: 'Chercher dans la liste',
  commandResults: 'Résultats',
  commandPlaceholder: 'Chercher…',
  commandEmpty: 'Aucun résultat.',
  notifications: 'Notifications',
  pagination: 'Pagination',
  previous: 'Précédent',
  next: 'Suivant',
  page: (n) => `Page ${n}`,
  morePages: 'Plus de pages',
  breadcrumb: 'Fil d’Ariane',
  morePath: 'Niveaux masqués',
  sidebar: 'Navigation principale',
  toggleSidebar: 'Afficher ou masquer la barre latérale',
  avatar: 'Avatar',
  locale: 'fr-FR',
  tier: (n, count) => `Palier ${n} sur ${count}`,
  tierShort: (n) => `Palier ${n}`,
  noData: 'Aucune donnée.',
  notRated: 'Non évalué',
  chartTable: 'Données du graphique',
  chartValue: 'Valeur',
  chartCategory: 'Catégorie',
};

const MessagesContext = React.createContext<Messages>(messagesFr);

/** Remplace les textes intégrés pour tout ce qui est dessous ; ce qui n'est pas fourni reste en français. */
export function MessagesProvider({ messages, children }: { messages: Partial<Messages>; children: React.ReactNode }) {
  const parent = React.useContext(MessagesContext);
  const value = React.useMemo(() => ({ ...parent, ...messages }), [parent, messages]);
  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

/** Les textes intégrés en vigueur (français, ou ce que `MessagesProvider` a remplacé). */
export function useMessages(): Messages {
  return React.useContext(MessagesContext);
}
