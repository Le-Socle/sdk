// Textes des composants d'application. Une section par composant ; défaut français, surchargeable
// en tout ou partie par `AppEngineProvider` (propriété `messages`). Des chaînes à gabarit (`{n}`),
// jamais des fonctions : elles passent d'un composant serveur à un composant client.
// Le singulier et le pluriel sont deux messages (`...One`, `...Many`) : `pick(n, one, many)`.

export interface AppMessages {
  states: {
    emptyTitle: string;
    errorTitle: string;
    retry: string;
    loading: string;
  };
  shell: {
    navigation: string;
    openNavigation: string;
    organizations: string;
    switchOrganization: string;
    scope: string;
    search: string;
    searchPlaceholder: string;
    userMenu: string;
    signOut: string;
  };
  table: {
    selectAll: string;
    selectRow: string;
    untitled: string;
    none: string;
    yes: string;
    no: string;
    emptyResults: string;
    sortAscending: string;
    sortDescending: string;
    groupNone: string;
    rowsCount: string;
  };
  filter: {
    add: string;
    addMore: string;
    by: string;
    noField: string;
    apply: string;
    remove: string;
    valueOf: string;
    searchValue: string;
    textSearched: string;
    value: string;
    noValue: string;
    me: string;
    yes: string;
    no: string;
    contains: string;
    is: string;
    includes: string;
    gte: string;
    lte: string;
    before: string;
    after: string;
    empty: string;
    notEmpty: string;
    reset: string;
  };
  bulk: {
    toolbar: string;
    selectedOne: string;
    selectedMany: string;
    edit: string;
    delete: string;
    cancel: string;
    confirmTitleOne: string;
    confirmTitleMany: string;
    confirmBody: string;
    confirmCancel: string;
    updatedOne: string;
    updatedMany: string;
    deletedOne: string;
    deletedMany: string;
  };
  field: {
    emptyEditable: string;
    emptyReadOnly: string;
    edit: string;
    save: string;
    cancel: string;
    validate: string;
    add: string;
    remove: string;
    noValue: string;
    filterOptions: string;
    selectedCount: string;
    search: string;
    searching: string;
    noResult: string;
    tagSearch: string;
    noTag: string;
    createTag: string;
    required: string;
    percent: string;
    source: string;
    noDate: string;
    saved: string;
  };
  drawer: {
    label: string;
    close: string;
    back: string;
    fullScreen: string;
    panel: string;
    notFound: string;
    sections: string;
    open: string;
    noTitle: string;
  };
  statBand: {
    label: string;
    evolution: string;
    funnel: string;
  };
  form: {
    create: string;
    submit: string;
    cancel: string;
    required: string;
    created: string;
  };
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export const appMessagesFr: AppMessages = {
  states: {
    emptyTitle: 'Rien à afficher',
    errorTitle: 'Impossible de charger ces données',
    retry: 'Réessayer',
    loading: 'Chargement en cours',
  },
  shell: {
    navigation: 'Navigation principale',
    openNavigation: 'Ouvrir la navigation',
    organizations: 'Organisations',
    switchOrganization: 'Changer d’organisation',
    scope: 'Périmètre',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher…',
    userMenu: 'Menu utilisateur',
    signOut: 'Se déconnecter',
  },
  table: {
    selectAll: 'Tout sélectionner',
    selectRow: 'Sélectionner la ligne',
    untitled: 'Sans titre',
    none: 'Non renseigné',
    yes: 'Oui',
    no: 'Non',
    emptyResults: 'Aucun résultat',
    sortAscending: 'Tri croissant',
    sortDescending: 'Tri décroissant',
    groupNone: 'Non renseigné',
    rowsCount: '{n} lignes',
  },
  filter: {
    add: 'Filtrer',
    addMore: 'Filtre',
    by: 'Filtrer par…',
    noField: 'Aucun champ',
    apply: 'Appliquer',
    remove: 'Retirer le filtre {label}',
    valueOf: 'Valeur du filtre {label}',
    searchValue: 'Filtrer…',
    textSearched: 'Texte recherché',
    value: 'Valeur',
    noValue: 'Aucune valeur',
    me: 'Moi',
    yes: 'oui',
    no: 'non',
    contains: 'contient',
    is: 'est',
    includes: 'inclut',
    gte: '≥',
    lte: '≤',
    before: 'avant le',
    after: 'après le',
    empty: 'est vide',
    notEmpty: 'n’est pas vide',
    reset: 'Effacer les filtres',
  },
  bulk: {
    toolbar: 'Actions groupées',
    selectedOne: '{n} sélectionné',
    selectedMany: '{n} sélectionnés',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler la sélection',
    confirmTitleOne: 'Supprimer cet enregistrement ?',
    confirmTitleMany: 'Supprimer {n} enregistrements ?',
    confirmBody: 'Cette action est définitive.',
    confirmCancel: 'Annuler',
    updatedOne: '{n} enregistrement modifié',
    updatedMany: '{n} enregistrements modifiés',
    deletedOne: '{n} enregistrement supprimé',
    deletedMany: '{n} enregistrements supprimés',
  },
  field: {
    emptyEditable: 'Vide',
    emptyReadOnly: 'Aucun',
    edit: 'Modifier {label}',
    save: 'Enregistrer',
    cancel: 'Annuler',
    validate: 'Valider',
    add: 'Ajouter',
    remove: 'Retirer {value}',
    noValue: 'Aucune valeur',
    filterOptions: 'Filtrer…',
    selectedCount: '{n} sélectionné(s)',
    search: 'Rechercher…',
    searching: 'Recherche…',
    noResult: 'Aucun résultat',
    tagSearch: 'Rechercher ou créer une étiquette…',
    noTag: 'Aucune étiquette',
    createTag: 'Créer l’étiquette « {label} »',
    required: '{label} : champ obligatoire.',
    percent: '{n} %',
    source: 'Source',
    noDate: 'Sans date',
    saved: 'Modification enregistrée',
  },
  drawer: {
    label: 'Détail de l’enregistrement',
    close: 'Fermer la fiche',
    back: 'Revenir à la fiche précédente',
    fullScreen: 'Plein écran',
    panel: 'Panneau',
    notFound: 'Cet enregistrement n’existe plus.',
    sections: 'Sections de la fiche',
    open: 'Ouvrir',
    noTitle: 'Sans titre',
  },
  statBand: {
    label: 'Chiffres clés',
    evolution: 'Évolution',
    funnel: 'Entonnoir',
  },
  form: {
    create: 'Créer',
    submit: 'Créer',
    cancel: 'Annuler',
    required: 'Obligatoire',
    created: 'Enregistrement créé',
  },
};

/** Fusion profonde : ce que l'application fournit remplace le défaut, le reste demeure. */
export function mergeMessages(base: AppMessages, over?: DeepPartial<AppMessages>): AppMessages {
  if (!over) return base;
  const out = { ...base } as Record<string, Record<string, string>>;
  for (const [section, values] of Object.entries(over as Record<string, Record<string, string> | undefined>)) {
    if (values) out[section] = { ...(base as unknown as Record<string, Record<string, string>>)[section], ...values };
  }
  return out as unknown as AppMessages;
}

/** Remplit un gabarit : `fillTemplate('{n} lignes', { n: 3 })`. Une clé absente laisse le repère tel quel. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
}

/** Choisit le message au singulier ou au pluriel. */
export function pick(n: number, one: string, many: string): string {
  return n > 1 ? many : one;
}
