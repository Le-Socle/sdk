// Moteur d'écrans : résolution des champs, filtres, tri, recherche, regroupement, formats, textes,
// adaptateur mémoire. Le code est celui de src/app, compilé à la volée (tests/lib/load-ts.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadTs } from './lib/load-ts.mjs';

const engine = await loadTs('src/app/engine/index.ts');
const demo = await loadTs('src/app/demo/index.ts');
const { createRegistry, getField, resolveFields, newLabel, validateObjectDef, matchesFilter, applyFilters, applySearch, applySort, groupRows, filterableFields, defaultOp, isSortable, nextSort, createFormatters, mergeMessages, appMessagesFr, fillTemplate } = engine;
const { project, person, demoObjects, demoRows, demoNow, createMemoryDataSource } = demo;

const rows = demoRows.project;

// --- Registre et champs ---
test('registre : retrouve un objet, refuse un objet inconnu et un doublon', () => {
  const reg = createRegistry(demoObjects);
  assert.equal(reg.get('project').plural, 'Projets');
  assert.equal(reg.has('person'), true);
  assert.equal(reg.has('nope'), false);
  assert.throws(() => reg.get('nope'), /inconnu/);
  assert.throws(() => createRegistry([project, project]), /deux fois/);
});

test('champs : résolution par clé et par clé d’identifiant', () => {
  assert.equal(getField(project, 'owner').type, 'user');
  assert.equal(getField(project, 'owner_id').key, 'owner');
  assert.equal(getField(project, 'absent'), undefined);
  assert.deepEqual(resolveFields(project, ['name', 'absent', 'status']).map((f) => f.key), ['name', 'status']);
});

test('libellé de création : accord au genre', () => {
  assert.equal(newLabel(project), 'Nouveau projet');
  assert.equal(newLabel(person), 'Nouvelle personne');
});

test('validation : les objets de démonstration sont cohérents, une colonne inconnue est signalée', () => {
  const reg = createRegistry(demoObjects);
  for (const d of demoObjects) assert.deepEqual(validateObjectDef(d, reg), []);
  const bad = { ...project, columns: ['name', 'ghost'] };
  assert.deepEqual(validateObjectDef(bad, reg), ['project : colonne « ghost » inconnue.']);
});

// --- Filtres ---
const f = (field, op, value) => ({ field, op, value });
const ids = (list) => list.map((r) => r.id);

test('filtre in sur un select', () => {
  const r = applyFilters(project, rows, [f('status', 'in', ['done', 'blocked'])]);
  assert.ok(r.length > 0 && r.every((x) => ['done', 'blocked'].includes(x.status)));
});

test('filtre in sur l’identifiant d’une relation (idKey) et sur un utilisateur', () => {
  const byClient = applyFilters(project, rows, [f('client_id', 'in', ['p1'])]);
  assert.ok(byClient.length > 0 && byClient.every((x) => x.client.id === 'p1'));
  const byOwner = applyFilters(project, rows, [f('owner_id', 'in', ['m2'])]);
  assert.ok(byOwner.length > 0 && byOwner.every((x) => x.owner.id === 'm2'));
});

test('filtre has sur des tags et sur des relations multiples', () => {
  const tagged = applyFilters(project, rows, [f('tags', 'has', ['t2'])]);
  assert.ok(tagged.length > 0 && tagged.every((x) => x.tags.some((t) => t.id === 't2')));
  const people = applyFilters(person, demoRows.person, [f('project_ids', 'has', 'j1')]);
  assert.deepEqual(ids(people), ['p1']);
});

test('filtre contains : sans accent ni casse', () => {
  const r = applyFilters(project, rows, [f('name', 'contains', 'MIGRATION de l’espace')]);
  assert.deepEqual(ids(r), ['j2']);
  assert.equal(applyFilters(project, rows, [f('name', 'contains', 'etude')]).length, 1);
});

test('filtres numériques et vides', () => {
  assert.ok(applyFilters(project, rows, [f('budget', 'gte', 50000)]).every((x) => x.budget >= 50000));
  assert.ok(applyFilters(project, rows, [f('budget', 'lt', 20000)]).every((x) => x.budget < 20000));
  const empties = applyFilters(project, rows, [f('budget', 'empty')]);
  assert.ok(empties.length > 0 && empties.every((x) => x.budget === null));
  assert.equal(applyFilters(project, rows, [f('budget', 'empty')]).length + applyFilters(project, rows, [f('budget', 'notEmpty')]).length, rows.length);
});

test('filtres de date : avant et après', () => {
  const before = applyFilters(project, rows, [f('due', 'before', '2026-10-01')]);
  assert.ok(before.every((x) => x.due < '2026-10-01'));
  const after = applyFilters(project, rows, [f('due', 'after', '2026-10-01')]);
  assert.equal(before.length + after.length + rows.filter((x) => x.due === '2026-10-01').length, rows.length);
});

test('filtres booléens, négation, et plusieurs filtres combinés', () => {
  assert.ok(applyFilters(project, rows, [f('late', 'isTrue')]).every((x) => x.late === true));
  assert.ok(applyFilters(project, rows, [f('status', 'notIn', ['done'])]).every((x) => x.status !== 'done'));
  assert.ok(applyFilters(project, rows, [f('status', 'neq', 'done')]).every((x) => x.status !== 'done'));
  const both = applyFilters(project, rows, [f('status', 'eq', 'active'), f('priority', 'eq', 'normal')]);
  assert.ok(both.every((x) => x.status === 'active' && x.priority === 'normal'));
});

test('un filtre sur un champ inconnu ne retient rien', () => {
  assert.equal(applyFilters(project, rows, [f('ghost', 'eq', 'x')]).length, 0);
  assert.equal(matchesFilter(project, rows[0], f('ghost', 'empty')), false);
});

// --- Recherche ---
test('recherche : tous les mots, sans accent, dans les clés de recherche', () => {
  assert.deepEqual(ids(applySearch(project, rows, 'portail client')), ['j1']);
  assert.deepEqual(ids(applySearch(project, rows, 'ENQUETE satisfaction')), ['j14']);
  assert.equal(applySearch(project, rows, '').length, rows.length);
  assert.equal(applySearch(project, rows, 'zzzz').length, 0);
});

// --- Tri ---
test('tri texte croissant et décroissant, stable', () => {
  const asc = applySort(project, rows, [{ key: 'name', dir: 'asc' }]);
  const desc = applySort(project, rows, [{ key: 'name', dir: 'desc' }]);
  assert.deepEqual(ids(asc), ids(desc).reverse());
  const names = asc.map((x) => x.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' })));
});

test('tri : les valeurs vides restent à la fin dans les deux sens', () => {
  for (const dir of ['asc', 'desc']) {
    const sorted = applySort(project, rows, [{ key: 'budget', dir }]);
    const firstEmpty = sorted.findIndex((x) => x.budget === null);
    assert.ok(firstEmpty > 0);
    assert.ok(sorted.slice(firstEmpty).every((x) => x.budget === null));
  }
  const asc = applySort(project, rows, [{ key: 'budget', dir: 'asc' }]).filter((x) => x.budget !== null).map((x) => x.budget);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
});

test('tri sur plusieurs clés et sur une date', () => {
  const sorted = applySort(project, rows, [{ key: 'status', dir: 'asc' }, { key: 'due', dir: 'desc' }]);
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    if (a.status === b.status) assert.ok(a.due >= b.due);
  }
});

test('tri : les nombres dans un texte se comparent comme des nombres', () => {
  const t = { id: 'x', name: '' };
  const data = [{ ...t, id: '1', name: 'Lot 10' }, { ...t, id: '2', name: 'Lot 2' }, { ...t, id: '3', name: 'Lot 1' }];
  assert.deepEqual(ids(applySort(project, data, [{ key: 'name', dir: 'asc' }])), ['3', '2', '1']);
});

test('clic sur l’en-tête : croissant puis alternance', () => {
  assert.deepEqual(nextSort(undefined, 'name'), [{ key: 'name', dir: 'asc' }]);
  assert.deepEqual(nextSort({ key: 'name', dir: 'asc' }, 'name'), [{ key: 'name', dir: 'desc' }]);
  assert.deepEqual(nextSort({ key: 'name', dir: 'desc' }, 'name'), [{ key: 'name', dir: 'asc' }]);
  assert.deepEqual(nextSort({ key: 'name', dir: 'desc' }, 'status'), [{ key: 'status', dir: 'asc' }]);
});

test('colonnes triables : les listes multiples ne se trient pas', () => {
  assert.equal(isSortable(getField(person, 'project_ids')), false);
  assert.equal(isSortable(getField(project, 'name')), true);
  assert.equal(isSortable(undefined), false);
});

// --- Regroupement ---
test('regroupement par select : dans l’ordre des options, vide en dernier', () => {
  const data = [...rows, { id: 'z', name: 'Sans statut', status: null }];
  const groups = groupRows(project, data, 'status', { emptyLabel: 'Non renseigné' });
  const keys = groups.map((g) => g.key);
  assert.equal(keys[keys.length - 1], '__none__');
  assert.equal(groups[groups.length - 1].label, 'Non renseigné');
  const order = ['idea', 'active', 'blocked', 'review', 'done'];
  const present = keys.filter((k) => k !== '__none__');
  assert.deepEqual(present, order.filter((k) => present.includes(k)));
  assert.equal(groups.reduce((n, g) => n + g.rows.length, 0), data.length);
});

test('regroupement par relation : par identifiant, libellé de la relation', () => {
  const groups = groupRows(project, rows, 'owner');
  assert.equal(groups.length, 3);
  assert.ok(groups.every((g) => g.label.includes(' ')));
});

// --- Filtres proposés ---
test('champs filtrables : le texte riche et les exclus sont écartés', () => {
  const keys = filterableFields({ ...project, fields: [...project.fields, { key: 'r', label: 'R', type: 'richtext' }, { key: 'x', label: 'X', type: 'text', filterable: false }] }).map((x) => x.key);
  assert.ok(!keys.includes('r') && !keys.includes('x') && keys.includes('name'));
});

test('opération par défaut selon le type', () => {
  assert.equal(defaultOp({ key: 'a', label: 'a', type: 'select' }), 'in');
  assert.equal(defaultOp({ key: 'a', label: 'a', type: 'tags' }), 'has');
  assert.equal(defaultOp({ key: 'a', label: 'a', type: 'currency' }), 'gte');
  assert.equal(defaultOp({ key: 'a', label: 'a', type: 'date' }), 'after');
  assert.equal(defaultOp({ key: 'a', label: 'a', type: 'text' }), 'contains');
});

// --- Formats ---
const fmt = createFormatters({ now: demoNow });
const nbsp = (s) => s.replace(/[\u202f\u00a0]/g, ' ');

test('montants : 2 décimales par défaut, 0 sur demande, vide pour une valeur absente', () => {
  assert.equal(nbsp(fmt.money(1234.5)), '1 234,50 €');
  assert.equal(nbsp(createFormatters({ moneyDigits: 0 }).money(1234.5)), '1 235 €');
  assert.equal(fmt.money(null), '');
  assert.equal(fmt.money('abc'), '');
  assert.equal(nbsp(fmt.money(1500000, true)), '1,5 M €');
});

test('nombres et pluriel', () => {
  assert.equal(nbsp(fmt.number(1234567)), '1 234 567');
  assert.equal(fmt.number(''), '');
  assert.equal(fmt.plural(1, 'projet', 'projets'), '1 projet');
  assert.equal(nbsp(fmt.plural(1200, 'projet', 'projets')), '1 200 projets');
});

test('dates : jours proches en mots, autre jour en date courte, année si autre année', () => {
  assert.equal(fmt.date('2026-10-22'), 'Aujourd’hui');
  assert.equal(fmt.date('2026-10-23'), 'Demain');
  assert.equal(fmt.date('2026-10-21'), 'Hier');
  assert.equal(nbsp(fmt.date('2026-03-05')), '5 mars');
  assert.equal(nbsp(fmt.date('2025-03-05')), '5 mars 2025');
  assert.equal(nbsp(fmt.date('2026-10-23', { full: true })), '23 oct. 2026');
  assert.equal(fmt.date(null), '');
  assert.equal(fmt.date('pas une date'), '');
});

test('date relative : unités j, sem., mois, an', () => {
  assert.equal(fmt.relative('2026-10-22'), 'aujourd’hui');
  assert.equal(fmt.relative('2026-10-19'), 'il y a 3 j');
  assert.equal(fmt.relative('2026-10-25'), 'dans 3 j');
  assert.equal(fmt.relative('2026-10-01'), 'il y a 3 sem.');
  assert.equal(fmt.relative('2026-06-22'), 'il y a 4 mois');
  assert.equal(fmt.relative('2025-10-22'), 'il y a 1 an');
  assert.equal(fmt.relative('2024-10-22'), 'il y a 2 ans');
  assert.equal(fmt.daysFromToday('2026-10-27'), 5);
  assert.equal(fmt.daysFromToday(''), null);
});

test('heure et valeur de champ datetime-local dans le fuseau configuré', () => {
  assert.equal(fmt.time('2026-10-22T08:05:00+02:00'), '08:05');
  assert.equal(fmt.toLocalInput('2026-10-22T08:05:00+02:00'), '2026-10-22T08:05');
  assert.equal(fmt.fromLocalInput(''), null);
  assert.equal(fmt.fromLocalInput('n’importe quoi'), null);
});

test('formats : un autre jeu de mots (anglais)', () => {
  const en = createFormatters({ locale: 'en-GB', now: demoNow, words: { today: 'today', past: '{n} ago', days: '{n} d' } });
  assert.equal(en.relative('2026-10-22'), 'today');
  assert.equal(en.relative('2026-10-19'), '3 d ago');
});

// --- Textes ---
test('textes : la fusion remplace une clé et garde les autres', () => {
  const m = mergeMessages(appMessagesFr, { states: { retry: 'Retry' } });
  assert.equal(m.states.retry, 'Retry');
  assert.equal(m.states.errorTitle, appMessagesFr.states.errorTitle);
  assert.equal(m.shell.search, appMessagesFr.shell.search);
  assert.equal(mergeMessages(appMessagesFr), appMessagesFr);
});

test('textes : gabarits avec {n} et {label}', () => {
  assert.equal(fillTemplate(appMessagesFr.bulk.selectedMany, { n: 3 }), '3 sélectionnés');
  assert.equal(fillTemplate(appMessagesFr.filter.remove, { label: 'Statut' }), 'Retirer le filtre Statut');
  assert.equal(fillTemplate('{x} reste', {}), '{x} reste');
});

// --- Adaptateur mémoire ---
test('adaptateur mémoire : liste filtrée, triée et cherchée', async () => {
  const ds = createMemoryDataSource();
  const r = await ds.list({ object: 'project', filters: [f('status', 'eq', 'active')], sort: [{ key: 'name', dir: 'desc' }] });
  assert.ok(r.length > 0 && r.every((x) => x.status === 'active'));
  const names = r.map((x) => x.name);
  assert.deepEqual(names, [...names].sort((a, b) => b.localeCompare(a, 'fr', { numeric: true, sensitivity: 'base' })));
  assert.equal((await ds.list({ object: 'project', search: 'formation' })).length, 1);
  assert.equal((await ds.list({ object: 'project', limit: 3 })).length, 3);
});

test('adaptateur mémoire : création, modification, relation, suppression', async () => {
  const ds = createMemoryDataSource();
  const { id } = await ds.create('project', { name: 'Essai', status: 'idea', owner: 'm1' });
  const made = await ds.get('project', id);
  assert.equal(made.name, 'Essai');
  assert.deepEqual(made.owner, { id: 'm1', label: 'Camille Fontaine' });
  await ds.update('project', id, { client: 'p3', status: 'active' });
  const upd = await ds.get('project', id);
  assert.equal(upd.status, 'active');
  assert.equal(upd.client.label, 'Sophie Girard');
  await ds.bulkUpdate('project', [id, 'j1'], { priority: 'high' });
  assert.equal((await ds.get('project', 'j1')).priority, 'high');
  assert.deepEqual(await ds.remove('project', [id]), { count: 1 });
  await assert.rejects(ds.get('project', id), /introuvable/);
});

test('adaptateur mémoire : choix de relation, étiquettes, vues enregistrées', async () => {
  const ds = createMemoryDataSource();
  const pick = await ds.pick('person', 'vid');
  assert.deepEqual(pick.map((p) => p.id), ['p5']);
  const tag = await ds.tags.create('Nouveau', 'sky');
  assert.ok((await ds.tags.list()).some((t) => t.id === tag.id));
  const { id } = await ds.savedViews.save({ object: 'project', name: 'Mes vues', config: {} });
  assert.equal((await ds.savedViews.list('project')).length, 1);
  await ds.savedViews.remove(id);
  assert.equal((await ds.savedViews.list('project')).length, 0);
});

test('adaptateur mémoire : modes erreur et vide', async () => {
  const ds = createMemoryDataSource({ mode: 'empty' });
  assert.deepEqual(await ds.list({ object: 'project' }), []);
  ds.setMode('error');
  await assert.rejects(ds.list({ object: 'project' }), /ne répond pas/);
});

test('adaptateur mémoire : les lignes renvoyées sont des copies', async () => {
  const ds = createMemoryDataSource();
  const [a] = await ds.list({ object: 'project', limit: 1 });
  a.name = 'Modifié hors source';
  const [b] = await ds.list({ object: 'project', limit: 1 });
  assert.notEqual(b.name, 'Modifié hors source');
});
