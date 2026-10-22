// Objets de démonstration : « Projet » et « Personne ». Génériques, sans donnée réelle ni marque.
// Ils couvrent les types de champ utiles aux stories et aux tests ; l'application fournit les siens.
import type { Color, FieldDef, ObjectDef, SelectOption } from '../engine/types';

/** Option de liste : la teinte est un nom symbolique (une marque décide de son rendu), pas une couleur. */
const opt = (value: string, label: string, tint: Color): SelectOption => ({ value, label, color: tint });

export const PROJECT_STATUSES: SelectOption[] = [
  opt('idea', 'À cadrer', 'gray'),
  opt('active', 'En cours', 'blue'),
  opt('blocked', 'Bloqué', 'red'),
  opt('review', 'En revue', 'amber'),
  opt('done', 'Terminé', 'green'),
];

export const PRIORITIES: SelectOption[] = [opt('low', 'Basse', 'gray'), opt('normal', 'Normale', 'sky'), opt('high', 'Haute', 'orange')];

export const ROLES: SelectOption[] = [opt('lead', 'Responsable', 'violet'), opt('member', 'Membre', 'teal'), opt('guest', 'Invité', 'gray')];

const tags: FieldDef = { key: 'tags', label: 'Étiquettes', type: 'tags', width: 44, sortable: false };

export const project: ObjectDef = {
  key: 'project',
  singular: 'projet',
  plural: 'Projets',
  icon: 'folder',
  titleKey: 'name',
  fields: [
    { key: 'name', label: 'Nom', type: 'text', required: true, width: 56, placeholder: 'Nom du projet' },
    { key: 'status', label: 'Statut', type: 'select', options: PROJECT_STATUSES, required: true, width: 32 },
    { key: 'priority', label: 'Priorité', type: 'select', options: PRIORITIES, width: 28 },
    { key: 'owner', label: 'Responsable', type: 'user', idKey: 'owner_id', width: 44 },
    { key: 'client', label: 'Client', type: 'relation', target: 'person', idKey: 'client_id', width: 44 },
    { key: 'budget', label: 'Budget', type: 'currency', width: 32 },
    { key: 'progress', label: 'Avancement', type: 'percent', width: 28 },
    { key: 'due', label: 'Échéance', type: 'date', overdueKey: 'late', width: 48 },
    { key: 'late', label: 'En retard', type: 'boolean', readOnly: true },
    { key: 'updated_at', label: 'Modifié', type: 'datetime', relative: true, readOnly: true, width: 28 },
    { key: 'links', label: 'Site', type: 'url', width: 40 },
    { key: 'notes', label: 'Notes', type: 'longtext', placeholder: 'Contexte, décisions, points d’attention…' },
    tags,
  ],
  columns: ['name', 'status', 'owner', 'budget', 'progress', 'due', 'tags'],
  defaultSort: [{ key: 'name', dir: 'asc' }],
  searchKeys: ['name', 'notes'],
  createFields: ['name', 'status', 'owner', 'client', 'budget', 'due'],
  groupable: ['status', 'priority', 'owner'],
  bulkEditable: ['status', 'priority', 'owner'],
  views: [
    { key: 'all', name: 'Tous les projets' },
    { key: 'active', name: 'En cours', filters: [{ field: 'status', op: 'in', value: ['active', 'review'] }] },
    { key: 'late', name: 'En retard', filters: [{ field: 'late', op: 'isTrue' }], sort: [{ key: 'due', dir: 'asc' }] },
  ],
  drawer: {
    header: ['status', 'owner', 'priority', 'tags'],
    sections: [
      { kind: 'fields', title: 'Fiche', fields: ['client', 'budget', 'progress', 'due', 'links', 'notes', 'updated_at'] },
      {
        kind: 'related',
        title: 'Personnes liées',
        object: 'person',
        filters: [{ field: 'project_ids', op: 'has', value: '$id' }],
        columns: ['name', 'role', 'email'],
        empty: 'Aucune personne liée à ce projet.',
      },
    ],
  },
  actions: [
    {
      key: 'archive',
      label: 'Terminer',
      method: 'project.finish',
      icon: 'star',
      bulk: true,
      when: { key: 'status', in: ['active', 'review'] },
      success: '{n} projet(s) terminé(s)',
    },
  ],
};

export const person: ObjectDef = {
  key: 'person',
  singular: 'personne',
  plural: 'Personnes',
  feminine: true,
  icon: 'user',
  titleKey: 'name',
  fields: [
    { key: 'name', label: 'Nom', type: 'text', required: true, width: 56, placeholder: 'Prénom et nom' },
    { key: 'role', label: 'Rôle', type: 'select', options: ROLES, width: 32 },
    { key: 'email', label: 'Courriel', type: 'emails', width: 56 },
    { key: 'phone', label: 'Téléphone', type: 'phones', width: 40 },
    { key: 'active', label: 'Actif', type: 'boolean', width: 20 },
    { key: 'project_ids', label: 'Projets', type: 'relations', target: 'project', width: 48 },
    { key: 'skills', label: 'Compétences', type: 'textlist', width: 48 },
    { key: 'since', label: 'Depuis', type: 'date', fullDate: true, width: 32 },
    tags,
  ],
  columns: ['name', 'role', 'email', 'phone', 'active', 'tags'],
  defaultSort: [{ key: 'name', dir: 'asc' }],
  searchKeys: ['name', 'email'],
  createFields: ['name', 'role', 'email'],
  groupable: ['role'],
  bulkEditable: ['role', 'active'],
  views: [
    { key: 'all', name: 'Toutes les personnes' },
    { key: 'leads', name: 'Responsables', filters: [{ field: 'role', op: 'eq', value: 'lead' }] },
  ],
  drawer: {
    header: ['role', 'active', 'tags'],
    sections: [{ kind: 'fields', title: 'Fiche', fields: ['email', 'phone', 'skills', 'since', 'project_ids'] }],
  },
};

export const demoObjects: ObjectDef[] = [project, person];
