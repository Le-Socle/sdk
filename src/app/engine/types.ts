// Types du moteur d'écrans par métadonnées : un objet se décrit une fois (champs, colonnes, vues,
// fiche, actions) et le moteur génère liste, filtres, fiche et formulaires. Aucun objet métier
// n'est défini ici : les applications fournissent les leurs (le SDK n'embarque que des données de
// démonstration, dans `app/demo`).
//
// Origine : métadonnées d'un CRM, généralisées. Retraits : la vue SQL, la table, les tables de
// liaison de tags et la colonne de propriétaire (propres au serveur de l'application : elles
// restent dans un type étendu de l'application, qui peut étendre `ObjectDef`).

/** Clé d'un objet : une chaîne libre (l'application en définit la liste). */
export type ObjectKey = string;

export type FieldType =
  | 'tags'
  | 'text'
  | 'longtext'
  | 'richtext'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'emails'
  | 'phones'
  | 'url'
  | 'textlist'
  | 'relation'
  | 'relations'
  | 'user'
  | 'users'
  | 'boolean'
  | 'task'
  | 'percent'
  | 'signals';

/** Teintes proposées pour les pastilles. Une marque décide de leur rendu (jetons de ton). */
export type Color =
  | 'gray'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'pink';

export interface SelectOption {
  value: string;
  label: string;
  color?: Color;
  /** Nom d'icône du jeu d'icônes de l'application. */
  icon?: string;
  /** Valeur posée par une action dédiée, pas proposée à la saisie (mettre `false`). */
  manualOnly?: false;
}

export type FilterOp =
  | 'contains'
  | 'eq'
  | 'neq'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'empty'
  | 'notEmpty'
  | 'has'
  | 'isTrue'
  | 'isFalse'
  | 'before'
  | 'after';

export interface Filter {
  field: string;
  op: FilterOp;
  value?: unknown;
  /** Libellés des valeurs choisies (relations), pour afficher la puce sans relire le serveur. */
  labels?: Record<string, string>;
}

export interface Sort {
  key: string;
  dir: 'asc' | 'desc';
}

export interface ViewConfig {
  filters?: Filter[];
  sort?: Sort[];
  columns?: string[];
  groupBy?: string | null;
  search?: string;
}

export interface BuiltinView extends ViewConfig {
  key: string;
  name: string;
}

export interface FieldDef {
  /** Clé du champ dans la ligne. */
  key: string;
  label: string;
  type: FieldType;
  /** Clé de la valeur d'identifiant pour une relation ou un utilisateur (filtres, écriture). */
  idKey?: string;
  readOnly?: boolean;
  required?: boolean;
  options?: SelectOption[];
  /** Nom d'une source d'options fournie par la source de données (`optionSources`). */
  optionsSource?: string;
  /** Objet cible d'une relation. */
  target?: ObjectKey;
  /** Restreint les choix d'une relation. */
  targetFilter?: Filter[];
  /** Clé d'une information secondaire affichée avec la valeur. */
  sub?: string;
  subOptions?: SelectOption[];
  /** Clé d'une colonne booléenne qui signale un retard (affichage en erreur). */
  overdueKey?: string;
  /** Dates en relatif (« il y a 3 j »). */
  relative?: boolean;
  /** Largeur souhaitée en colonne, en unités de 4 px (1 = 0,25 rem), pas en pixels. */
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  description?: string;
  placeholder?: string;
  /** Texte affiché quand la valeur est vide. */
  emptyLabel?: string;
  /** Toujours afficher l'année. */
  fullDate?: boolean;
  /** Alignement du texte en colonne (les nombres se calent à droite par défaut). */
  align?: 'start' | 'end';
}

export interface RelatedSection {
  kind: 'related';
  title: string;
  object: ObjectKey;
  /** Filtres ; la valeur `$id` est remplacée par l'identifiant de l'enregistrement. */
  filters: Filter[];
  columns: string[];
  sort?: Sort[];
  empty: string;
}

export interface FieldsSection {
  kind: 'fields';
  title: string;
  fields: string[];
}

/** Section fournie par l'application (clé du registre de sections). */
export interface CustomSection {
  kind: 'custom';
  key: string;
  title: string;
}

export type DrawerSection = FieldsSection | RelatedSection | CustomSection;

export interface DrawerDef {
  /** Champs clés, éditables dans l'en-tête. */
  header: string[];
  sections: DrawerSection[];
}

/** Action métier déclarée dans la métadonnée : bouton de fiche, de ligne ou d'actions groupées. */
export interface RecordActionDef {
  key: string;
  label: string;
  icon?: string;
  /** Nom de la méthode appelée sur la source de données (`runAction`). */
  method: string;
  input?: Record<string, unknown>;
  tone?: 'primary' | 'danger' | 'default';
  /** L'action ne s'applique qu'aux enregistrements dont la valeur correspond. */
  when?: { key: string; in: unknown[] };
  /** Demande un motif avant d'agir. */
  reason?: { title: string; options: SelectOption[] };
  /** Proposée dans la barre d'actions groupées. */
  bulk?: boolean;
  /** Message de confirmation (`{n}` = nombre d'enregistrements). */
  success?: string;
}

export interface ObjectDef {
  key: ObjectKey;
  singular: string;
  plural: string;
  /** Genre grammatical, pour « Nouveau » et « Nouvelle ». */
  feminine?: boolean;
  /** Nom d'icône du jeu d'icônes de l'application. */
  icon: string;
  titleKey: string;
  subtitleKey?: string;
  fields: FieldDef[];
  /** Colonnes de la liste par défaut. */
  columns: string[];
  defaultSort: Sort[];
  /** Champs parcourus par la recherche. */
  searchKeys: string[];
  /** Champs demandés à la création. */
  createFields: string[];
  views: BuiltinView[];
  drawer: DrawerDef;
  /** Pas de liste dédiée dans la navigation. */
  hidden?: boolean;
  /** La colonne titre s'affiche comme un champ ordinaire (éditable). */
  plainTitle?: boolean;
  groupable?: string[];
  bulkEditable?: string[];
  actions?: RecordActionDef[];
  /** Pas de suppression depuis l'interface. */
  undeletable?: boolean;
}

/** Cockpit : écran de pilotage au-dessus d'une liste, avec un bandeau de chiffres. */
export interface CockpitDef {
  key: string;
  object: ObjectKey;
  title: string;
  /** Nom de la statistique demandée à la source de données (`stats`). */
  stats: string;
  baseFilters?: Filter[];
  columns: string[];
  views: BuiltinView[];
  /** Clé d'un composant fourni par l'application pour l'affichage principal. */
  board?: string;
}
