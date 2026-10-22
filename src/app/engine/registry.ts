import type { FieldDef, ObjectDef, ObjectKey } from './types';

/** Registre des objets : l'application lui donne ses définitions, le moteur les relit par clé. */
export interface ObjectRegistry {
  get(key: ObjectKey): ObjectDef;
  has(key: string): boolean;
  all(): ObjectDef[];
  /** Champ d'un objet par sa clé, ou par la clé de son identifiant (`idKey`). */
  field(def: ObjectDef, key: string): FieldDef | undefined;
}

/** Champ d'un objet par sa clé (ou par `idKey`, pour les filtres posés sur l'identifiant d'une relation). */
export function getField(def: ObjectDef, key: string): FieldDef | undefined {
  return def.fields.find((f) => f.key === key) ?? def.fields.find((f) => f.idKey === key);
}

export function createRegistry(defs: ObjectDef[]): ObjectRegistry {
  const map = new Map<string, ObjectDef>();
  for (const d of defs) {
    if (map.has(d.key)) throw new Error(`Objet « ${d.key} » défini deux fois.`);
    map.set(d.key, d);
  }
  return {
    get(key) {
      const d = map.get(key);
      if (!d) throw new Error(`Objet inconnu : « ${key} ».`);
      return d;
    },
    has: (key) => map.has(key),
    all: () => [...map.values()],
    field: getField,
  };
}

/** Champs d'un objet résolus dans l'ordre d'une liste de clés ; les clés inconnues sont ignorées. */
export function resolveFields(def: ObjectDef, keys: string[]): FieldDef[] {
  const out: FieldDef[] = [];
  for (const k of keys) {
    const f = getField(def, k);
    if (f) out.push(f);
  }
  return out;
}

/** « Nouveau projet » / « Nouvelle personne » : accord selon le genre de l'objet. */
export function newLabel(def: ObjectDef): string {
  return `${def.feminine ? 'Nouvelle' : 'Nouveau'} ${def.singular}`;
}

/** Vérifie une définition : clés de colonnes, de tri, de recherche et de fiche qui existent. Retourne les erreurs. */
export function validateObjectDef(def: ObjectDef, registry?: ObjectRegistry): string[] {
  const errors: string[] = [];
  const has = (k: string) => !!getField(def, k);
  const keys = new Set<string>();
  for (const f of def.fields) {
    if (keys.has(f.key)) errors.push(`${def.key} : champ « ${f.key} » défini deux fois.`);
    keys.add(f.key);
    if ((f.type === 'relation' || f.type === 'relations') && !f.target && !f.idKey) errors.push(`${def.key}.${f.key} : relation sans cible.`);
    if (f.target && registry && !registry.has(f.target)) errors.push(`${def.key}.${f.key} : cible « ${f.target} » inconnue.`);
  }
  if (!has(def.titleKey)) errors.push(`${def.key} : titleKey « ${def.titleKey} » inconnu.`);
  for (const k of def.columns) if (!has(k)) errors.push(`${def.key} : colonne « ${k} » inconnue.`);
  for (const k of def.searchKeys) if (!has(k)) errors.push(`${def.key} : clé de recherche « ${k} » inconnue.`);
  for (const k of def.createFields) if (!has(k)) errors.push(`${def.key} : champ de création « ${k} » inconnu.`);
  for (const s of def.defaultSort) if (!has(s.key)) errors.push(`${def.key} : tri « ${s.key} » inconnu.`);
  for (const k of def.drawer.header) if (!has(k)) errors.push(`${def.key} : champ d'en-tête « ${k} » inconnu.`);
  return errors;
}
