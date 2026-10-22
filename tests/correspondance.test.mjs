// Table de correspondance des jetons (issue #47) : le risque dépend du nombre de paliers de la marque,
// et une ancienne valeur calculée par color-mix() n'est jamais classée « identique ».
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rows = JSON.parse(fs.readFileSync(path.join(root, 'docs/correspondance-jetons.json'), 'utf8')).rows;
const md = fs.readFileSync(path.join(root, 'docs/correspondance-jetons.md'), 'utf8');

test('aucun color-mix de la charte d’origine n’est classé « identique »', () => {
  const mix = ['--color-overlay', '--color-scrim', '--shadow-1', '--shadow-2', '--shadow-3'];
  for (const r of rows.filter((x) => mix.includes(x.ancien))) assert.equal(r.statut, 'équivalent', r.ancien);
  for (const r of rows.filter((x) => /^--color-field-.*-line$/.test(x.ancien))) assert.match(r.note, /color-mix/, r.ancien);
});

test('le risque dit qu’il suppose une marque à 4 paliers et renvoie vers la marque à 6 paliers', () => {
  for (const r of rows.filter((x) => /^--color-risk-/.test(x.ancien))) {
    assert.match(r.note, /marque à 4 paliers/, r.ancien);
    assert.match(r.note, /6 paliers/, r.ancien);
  }
  assert.match(md, /## Risque et nombre de paliers/);
  assert.match(md, /palier 6 \(le palier 5 est un « très fragile » neuf\)/);
  assert.match(md, /`--color-data-5…6-\*`/);
});
