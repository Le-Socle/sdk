// Contrats entre le moteur d'écrans et l'application qui l'héberge. Le SDK ne connaît ni le
// routeur, ni le serveur, ni le stockage du navigateur : tout passe par ces interfaces, fournies
// une fois à `AppEngineProvider`. L'adaptateur mémoire (`createMemoryDataSource`) les remplit pour
// Storybook et les tests.
import type * as React from 'react';
import type { Color, Filter, ObjectDef, ObjectKey, SelectOption, Sort, ViewConfig } from './types';
import type { Row } from './query';

export type { Row } from './query';

/** Valeur d'une relation telle que la source la renvoie. */
export interface Ref {
  id: string;
  label: string;
  object?: ObjectKey;
  /** Information secondaire (courriel, rôle). */
  sub?: string | null;
}

export interface Tag {
  id: string;
  label: string;
  color: Color | string;
}

export interface Member {
  id: string;
  label: string;
  email?: string;
}

export interface ListQuery {
  object: ObjectKey;
  filters?: Filter[];
  sort?: Sort[];
  search?: string;
  limit?: number;
}

export interface SavedView {
  id: string;
  name: string;
  config: ViewConfig;
}

export interface DataSource {
  /** Contexte opaque (organisation, périmètre…) : fait partie des clés de rechargement. */
  readonly context: Readonly<Record<string, unknown>>;
  list(q: ListQuery): Promise<Row[]>;
  get(object: ObjectKey, id: string): Promise<Row>;
  create(object: ObjectKey, input: Record<string, unknown>): Promise<{ id: string }>;
  update(object: ObjectKey, id: string, patch: Record<string, unknown>): Promise<void>;
  bulkUpdate(object: ObjectKey, ids: string[], patch: Record<string, unknown>): Promise<void>;
  remove(object: ObjectKey, ids: string[]): Promise<{ count: number }>;
  /** Choix d'une relation : recherche d'enregistrements d'un objet cible. */
  pick(target: ObjectKey, q: string, filters?: Filter[]): Promise<Ref[]>;
  runAction?(method: string, input: { ids: string[]; reason?: string } & Record<string, unknown>): Promise<unknown>;
  stats?<T = unknown>(key: string): Promise<T>;
  /** Listes d'options nommées (`FieldDef.optionsSource`). */
  optionSources?(): Promise<Record<string, SelectOption[]>>;
  members?(): Promise<Member[]>;
  tags?: { list(): Promise<Tag[]>; create(label: string, color: Color | string): Promise<Tag> };
  savedViews?: {
    list(object: ObjectKey): Promise<SavedView[]>;
    save(v: { object: ObjectKey; name: string; config: ViewConfig; id?: string }): Promise<{ id: string }>;
    remove(id: string): Promise<void>;
  };
  onUnauthorized?(): void;
}

/** Navigation : pile de fiches dans l'URL, liens de la coque. Next.js, Vite ou une page statique la fournissent. */
export interface Navigation {
  pathname: string;
  searchParams: URLSearchParams;
  push(href: string, opts?: { scroll?: boolean }): void;
  replace(href: string, opts?: { scroll?: boolean }): void;
  /** Lien de l'application (`next/link`, ou un `<a>`). */
  Link: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
}

export interface AppOrg {
  id: string;
  name: string;
  /** Initiale affichée dans la pastille (défaut : première lettre du nom). */
  initial?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
}

export interface AppSession {
  user: AppUser;
  orgs: AppOrg[];
  orgId: string;
  roleLabel?: string;
  /** Périmètre « Moi / Tout le monde ». */
  scope?: { value: string; options: { value: string; label: string }[] };
  onSwitchOrg?(id: string): void | Promise<void>;
  onScopeChange?(value: string): void | Promise<void>;
  onSignOut?(): void | Promise<void>;
}

/** Stockage de préférences (mode de la fiche, tailles). Défaut : `localStorage` protégé. */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface Notifier {
  success(message: string): void;
  error(message: string): void;
}

export type IconComponent = React.ComponentType<{ className?: string }>;
/** Jeu d'icônes par nom (`ObjectDef.icon`, `SelectOption.icon`). Complète le jeu de base du SDK. */
export type IconSet = Record<string, IconComponent>;

/** Points d'extension pour ce qui est propre à l'application. */
export interface EngineSlots {
  /** Sections de fiche personnalisées (`DrawerSection` de genre `custom`), par clé. */
  drawerSections?: Record<string, (p: { def: ObjectDef; rec: Row }) => React.ReactNode>;
  /** Contenu ajouté à droite du titre d'une fiche. */
  headerExtras?: (p: { def: ObjectDef; rec: Row }) => React.ReactNode;
}
