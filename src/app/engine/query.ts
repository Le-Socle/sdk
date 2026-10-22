// Évaluation locale des filtres, tris, recherche et regroupements. Sert l'adaptateur mémoire
// (démonstration, tests, Storybook) et toute application dont la source de données renvoie tout
// et laisse le navigateur filtrer. Un serveur réel applique la même sémantique de son côté.
import { getField } from './registry';
import type { FieldDef, Filter, ObjectDef, Sort } from './types';

export type Row = Record<string, unknown> & { id: string };

export function isEmptyValue(v: unknown): boolean {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
}

/** Identifiant d'une valeur de relation (`{ id, label }`), d'une liste ou d'un scalaire. */
function idsOf(v: unknown): string[] {
  if (isEmptyValue(v)) return [];
  if (Array.isArray(v)) return v.flatMap(idsOf);
  if (typeof v === 'object' && v && 'id' in v) return [String((v as { id: unknown }).id)];
  return [String(v)];
}

/** Texte comparable d'une valeur : libellé d'une relation, liste jointe, sinon la chaîne. */
export function textOf(v: unknown): string {
  if (isEmptyValue(v)) return '';
  if (Array.isArray(v)) return v.map(textOf).join(' ');
  if (typeof v === 'object' && v) {
    const o = v as { label?: unknown; name?: unknown };
    return String(o.label ?? o.name ?? '');
  }
  return String(v);
}

/** Valeur lue pour comparer une ligne à un filtre : un filtre posé sur `idKey` lit l'identifiant de la relation. */
function valueFor(def: ObjectDef, row: Row, key: string): unknown {
  const direct = row[key];
  if (direct !== undefined) return direct;
  const f = def.fields.find((x) => x.idKey === key);
  return f ? row[f.key] : undefined;
}

function norm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}

function asNumber(v: unknown): number {
  return typeof v === 'number' ? v : Number(v);
}

function asTime(v: unknown): number {
  const t = v instanceof Date ? v.getTime() : Date.parse(String(v));
  return Number.isNaN(t) ? Number.NaN : t;
}

/** Vrai quand la ligne satisfait le filtre. Un filtre sur un champ inconnu ne retient rien (jamais de résultat silencieusement faux). */
export function matchesFilter(def: ObjectDef, row: Row, f: Filter): boolean {
  if (!getField(def, f.field) && !(f.field in row)) return false;
  const v = valueFor(def, row, f.field);
  const field = getField(def, f.field);
  const wanted = Array.isArray(f.value) ? f.value : f.value === undefined ? [] : [f.value];
  switch (f.op) {
    case 'empty':
      return isEmptyValue(v);
    case 'notEmpty':
      return !isEmptyValue(v);
    case 'isTrue':
      return v === true;
    case 'isFalse':
      return v === false || v === null || v === undefined;
    case 'contains':
      return norm(textOf(v)).includes(norm(String(f.value ?? '')));
    case 'eq':
      return idsOf(v).some((x) => x === String(f.value)) || (typeof v === 'number' && v === asNumber(f.value));
    case 'neq':
      return !matchesFilter(def, row, { ...f, op: 'eq' });
    case 'in': {
      const have = idsOf(v);
      return wanted.some((w) => have.includes(String(w)));
    }
    case 'notIn': {
      const have = idsOf(v);
      return !wanted.some((w) => have.includes(String(w)));
    }
    case 'has': {
      const have = idsOf(v);
      return wanted.some((w) => have.includes(String(w)));
    }
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const dated = field?.type === 'date' || field?.type === 'datetime';
      const a = dated ? asTime(v) : asNumber(v);
      const b = dated ? asTime(f.value) : asNumber(f.value);
      if (Number.isNaN(a) || Number.isNaN(b) || isEmptyValue(v)) return false;
      return f.op === 'gt' ? a > b : f.op === 'gte' ? a >= b : f.op === 'lt' ? a < b : a <= b;
    }
    case 'before':
    case 'after': {
      const a = asTime(v);
      const b = asTime(f.value);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      return f.op === 'before' ? a < b : a > b;
    }
    default:
      return false;
  }
}

export function applyFilters(def: ObjectDef, rows: Row[], filters: Filter[] = []): Row[] {
  return filters.length ? rows.filter((r) => filters.every((f) => matchesFilter(def, r, f))) : rows;
}

/** Recherche plein texte sur les clés de recherche de l'objet (sans accent, sans casse, tous les mots). */
export function applySearch(def: ObjectDef, rows: Row[], search?: string): Row[] {
  const words = norm(search ?? '').split(/\s+/).filter(Boolean);
  if (!words.length) return rows;
  return rows.filter((r) => {
    const hay = norm(def.searchKeys.map((k) => textOf(r[k])).join(' '));
    return words.every((w) => hay.includes(w));
  });
}

function compareValues(field: FieldDef | undefined, a: unknown, b: unknown, locale: string): number {
  const ea = isEmptyValue(a);
  const eb = isEmptyValue(b);
  // Les valeurs vides passent toujours après les autres, quel que soit le sens du tri.
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1;
  const t = field?.type;
  if (t === 'number' || t === 'currency' || t === 'percent' || typeof a === 'number') return asNumber(a) - asNumber(b);
  if (t === 'date' || t === 'datetime') return asTime(a) - asTime(b);
  if (t === 'boolean') return Number(a) - Number(b);
  return textOf(a).localeCompare(textOf(b), locale, { numeric: true, sensitivity: 'base' });
}

/** Tri stable sur plusieurs clés. Les valeurs vides restent en fin de liste dans les deux sens. */
export function applySort(def: ObjectDef, rows: Row[], sort: Sort[] = [], locale = 'fr'): Row[] {
  if (!sort.length) return rows;
  const indexed = rows.map((row, i) => ({ row, i }));
  indexed.sort((x, y) => {
    for (const s of sort) {
      const field = getField(def, s.key);
      const a = x.row[s.key];
      const b = y.row[s.key];
      const emptyA = isEmptyValue(a);
      const emptyB = isEmptyValue(b);
      if (emptyA || emptyB) {
        if (emptyA !== emptyB) return emptyA ? 1 : -1;
        continue;
      }
      const c = compareValues(field, a, b, locale);
      if (c !== 0) return s.dir === 'desc' ? -c : c;
    }
    return x.i - y.i;
  });
  return indexed.map((x) => x.row);
}

export interface RowGroup {
  key: string;
  label: string;
  rows: Row[];
}

/** Regroupe des lignes par valeur d'un champ ; le groupe « non renseigné » passe en dernier. */
export function groupRows(def: ObjectDef, rows: Row[], groupBy: string, opts: { emptyLabel?: string; locale?: string } = {}): RowGroup[] {
  const field = getField(def, groupBy);
  const options = field?.options;
  const map = new Map<string, RowGroup>();
  for (const r of rows) {
    const v = r[groupBy];
    let key = '__none__';
    let label = opts.emptyLabel ?? '—';
    if (!isEmptyValue(v)) {
      key = idsOf(v)[0] ?? String(v);
      const opt = options?.find((o) => o.value === key);
      label = opt?.label ?? textOf(v);
    }
    const g = map.get(key) ?? { key, label, rows: [] };
    g.rows.push(r);
    map.set(key, g);
  }
  const order = (g: RowGroup) => (g.key === '__none__' ? Number.MAX_SAFE_INTEGER : options ? Math.max(0, options.findIndex((o) => o.value === g.key)) : 0);
  return [...map.values()].sort((a, b) => order(a) - order(b) || a.label.localeCompare(b.label, opts.locale ?? 'fr'));
}

/** Champs que le filtre peut proposer : ceux qui ne sont pas explicitement exclus ni du texte riche. */
export function filterableFields(def: ObjectDef): FieldDef[] {
  return def.fields.filter((f) => f.filterable !== false && f.type !== 'richtext' && !(f.type === 'relation' && !f.idKey && !f.target));
}

/** Opération proposée par défaut pour un type de champ. */
export function defaultOp(f: FieldDef): Filter['op'] {
  switch (f.type) {
    case 'select':
    case 'relation':
    case 'user':
      return 'in';
    case 'relations':
    case 'users':
    case 'tags':
      return 'has';
    case 'boolean':
      return 'isTrue';
    case 'number':
    case 'currency':
    case 'percent':
      return 'gte';
    case 'date':
    case 'datetime':
      return 'after';
    default:
      return 'contains';
  }
}

/** Vrai quand une colonne se trie (les champs multiples et les tags ne se trient pas). */
export function isSortable(f: FieldDef | undefined): boolean {
  return !!f && f.sortable !== false && f.type !== 'relations' && f.type !== 'users';
}

/** Tri demandé par un clic sur l'en-tête : croissant, puis alternance croissant / décroissant (comme LifeOS). */
export function nextSort(current: Sort | undefined, key: string): Sort[] {
  if (current?.key === key) return [{ key, dir: current.dir === 'asc' ? 'desc' : 'asc' }];
  return [{ key, dir: 'asc' }];
}
