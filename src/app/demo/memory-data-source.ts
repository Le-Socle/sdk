// Adaptateur mémoire : une `DataSource` complète sur des tableaux. Filtre, tri, recherche,
// création, modification, suppression réels (même sémantique que `engine/query`). Sert Storybook,
// les tests et les pages d'essai ; il ne sert jamais de stockage de production.
import type { DataSource, ListQuery, Member, SavedView, Tag } from '../engine/contracts';
import { applyFilters, applySearch, applySort, type Row } from '../engine/query';
import type { ObjectDef, ObjectKey, SelectOption, ViewConfig } from '../engine/types';
import { createRegistry, type ObjectRegistry } from '../engine/registry';
import { demoMembers, demoRows, demoTags } from './data';
import { demoObjects, PROJECT_STATUSES } from './objects';

export interface MemoryOptions {
  registry?: ObjectRegistry;
  rows?: Record<string, Row[]>;
  members?: Member[];
  tags?: Tag[];
  /** Latence simulée en millisecondes (0 par défaut ; 120 donne un chargement visible en story). */
  latency?: number;
  /** `error` : toute lecture échoue. `empty` : toute liste est vide. */
  mode?: 'normal' | 'error' | 'empty';
  context?: Record<string, unknown>;
  optionSources?: Record<string, SelectOption[]>;
}

const wait = (ms: number) => (ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve());

/** Dernier état d'une source mémoire : les stories le lisent pour vérifier une écriture. */
export interface MemoryDataSource extends DataSource {
  readonly tables: Record<string, Row[]>;
  setMode(mode: NonNullable<MemoryOptions['mode']>): void;
  calls: string[];
}

export function createMemoryDataSource(opts: MemoryOptions = {}): MemoryDataSource {
  const registry = opts.registry ?? createRegistry(demoObjects);
  const members = opts.members ?? demoMembers;
  const tags = [...(opts.tags ?? demoTags)];
  const tables: Record<string, Row[]> = Object.fromEntries(
    Object.entries(opts.rows ?? demoRows).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]),
  );
  const views: (SavedView & { object: ObjectKey })[] = [];
  let mode = opts.mode ?? 'normal';
  const latency = opts.latency ?? 0;
  const calls: string[] = [];
  let seq = 1000;

  const table = (object: ObjectKey) => (tables[object] ??= []);
  const guard = async (name: string) => {
    calls.push(name);
    await wait(latency);
    if (mode === 'error') throw new Error('La source de données ne répond pas.');
  };
  const def = (object: ObjectKey): ObjectDef => registry.get(object);

  /** Une écriture de relation reçoit un identifiant ou une liste d'identifiants : on la range avec son libellé. */
  const normalizePatch = (object: ObjectKey, patch: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    const d = def(object);
    for (const [k, v] of Object.entries(patch)) {
      const f = d.fields.find((x) => x.key === k);
      if (f?.type === 'user' || f?.type === 'users') {
        const toRef = (id: unknown) => {
          const mem = members.find((x) => x.id === id);
          return mem ? { id: mem.id, label: mem.label } : null;
        };
        out[k] = Array.isArray(v) ? v.map(toRef).filter(Boolean) : toRef(v);
        if (f.idKey) out[f.idKey] = v;
      } else if (f?.type === 'tags') {
        out[k] = Array.isArray(v) ? v.map((id) => tags.find((x) => x.id === id)).filter(Boolean) : [];
      } else if (f?.type === 'relation' && f.target) {
        const hit = v ? table(f.target).find((x) => x.id === v) : null;
        const title = f.target ? def(f.target).titleKey : 'name';
        out[k] = hit ? { id: hit.id, label: String(hit[title] ?? ''), object: f.target } : null;
        if (f.idKey) out[f.idKey] = v ?? null;
      } else out[k] = v;
    }
    return out;
  };

  const source: MemoryDataSource = {
    context: opts.context ?? { org: 'demo' },
    tables,
    calls,
    setMode: (m) => {
      mode = m;
    },
    async list(q: ListQuery) {
      await guard('list');
      if (mode === 'empty') return [];
      const d = def(q.object);
      let rows = applyFilters(d, table(q.object), q.filters);
      rows = applySearch(d, rows, q.search);
      rows = applySort(d, rows, q.sort && q.sort.length ? q.sort : d.defaultSort);
      return (q.limit ? rows.slice(0, q.limit) : rows).map((r) => ({ ...r }));
    },
    async get(object, id) {
      await guard('get');
      const r = table(object).find((x) => x.id === id);
      if (!r) throw new Error('Enregistrement introuvable.');
      return { ...r };
    },
    async create(object, input) {
      await guard('create');
      const id = `${object[0]}${++seq}`;
      const row: Row = { id, tags: [], ...normalizePatch(object, input) } as Row;
      table(object).unshift(row);
      return { id };
    },
    async update(object, id, patch) {
      await guard('update');
      const r = table(object).find((x) => x.id === id);
      if (!r) throw new Error('Enregistrement introuvable.');
      Object.assign(r, normalizePatch(object, patch));
    },
    async bulkUpdate(object, ids, patch) {
      await guard('bulkUpdate');
      const set = normalizePatch(object, patch);
      for (const r of table(object)) if (ids.includes(r.id)) Object.assign(r, set);
    },
    async remove(object, ids) {
      await guard('remove');
      const before = table(object).length;
      tables[object] = table(object).filter((r) => !ids.includes(r.id));
      return { count: before - table(object).length };
    },
    async pick(target, q, filters) {
      await guard('pick');
      const d = def(target);
      let rows = applyFilters(d, table(target), filters);
      rows = applySearch(d, rows, q);
      return rows.slice(0, 20).map((r) => ({ id: r.id, label: String(r[d.titleKey] ?? ''), object: target }));
    },
    async runAction(method, input) {
      await guard(`runAction:${method}`);
      return { ok: true, ids: input.ids };
    },
    async stats<T>(key: string) {
      await guard('stats');
      const all = table('project');
      return { key, total: all.length, active: all.filter((r) => r.status === 'active').length } as T;
    },
    async optionSources() {
      return opts.optionSources ?? { projectStatuses: PROJECT_STATUSES };
    },
    async members() {
      await guard('members');
      return members;
    },
    tags: {
      async list() {
        await guard('tags.list');
        return [...tags];
      },
      async create(label, color) {
        await guard('tags.create');
        const tag: Tag = { id: `t${++seq}`, label, color };
        tags.push(tag);
        return tag;
      },
    },
    savedViews: {
      async list(object) {
        return views.filter((v) => v.object === object);
      },
      async save(v: { object: ObjectKey; name: string; config: ViewConfig; id?: string }) {
        const id = v.id ?? `v${++seq}`;
        const i = views.findIndex((x) => x.id === id);
        const next = { id, object: v.object, name: v.name, config: v.config };
        if (i >= 0) views[i] = next;
        else views.push(next);
        return { id };
      },
      async remove(id) {
        const i = views.findIndex((x) => x.id === id);
        if (i >= 0) views.splice(i, 1);
      },
    },
  };
  return source;
}
