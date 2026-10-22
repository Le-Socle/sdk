// Libellés de paliers dans brand.json (issue #46) : lecture, contrôle, sortie CSS, priorité d'affichage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildAll } from '../scripts/lib/build-all.mjs';
import { readTierLabels } from '../scripts/lib/tokens-core.mjs';
import { loadTs } from './lib/load-ts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('readTierLabels : accepte une liste par langue, refuse une longueur ou un code faux', () => {
  assert.equal(readTierLabels({}), null);
  assert.deepEqual(readTierLabels({ dataScale: { steps: 2 }, tierLabels: { fr: ['A', 'B'] } }), { fr: ['A', 'B'] });
  assert.throws(() => readTierLabels({ dataScale: { steps: 3 }, tierLabels: { fr: ['A', 'B'] } }), /2 libellés pour 3 paliers/);
  assert.throws(() => readTierLabels({ tierLabels: { FR_fr: ['A'] } }), /code de langue/);
  assert.throws(() => readTierLabels({ tierLabels: { fr: ['A', ''] } }), /textes non vides/);
});

test('la marque de démonstration émet --tier-label-<langue>-<n> dans brand.css et tierLabels dans le TypeScript', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-tl-'));
  await buildAll({ tokensDir: path.join(root, 'tokens'), brandsDir: path.join(root, 'brands'), fontsDir: path.join(root, 'fonts'), genDir: dir, typesImport: '../types' });
  const css = fs.readFileSync(path.join(dir, 'brands/demo/brand.css'), 'utf8');
  assert.match(css, /--tier-label-fr-1: "Excellent";/);
  assert.match(css, /--tier-label-en-6: "Critical";/);
  assert.match(fs.readFileSync(path.join(dir, 'ts/demo.ts'), 'utf8'), /export const tierLabels/);
});

test('priorité : propriété du composant, puis MessagesProvider, puis marque, sinon rien', async () => {
  const { resolveTierLabels, brandTierLabels, parseTierLabel } = await loadTs('src/ui/charts/use-tier-labels.ts', { bundleAll: true });
  const vars = { '--tier-label-fr-1': '"Bon"', '--tier-label-fr-2': '"Mauvais"', '--tier-label-en-1': '"Good"', '--tier-label-en-2': '"Bad"' };
  const read = (n) => vars[n] ?? '';
  const brand = brandTierLabels('fr-FR', 2, read);
  assert.deepEqual(brand, ['Bon', 'Mauvais']);
  assert.deepEqual(brandTierLabels('en-GB', 2, read), ['Good', 'Bad']);
  assert.deepEqual(brandTierLabels('de-DE', 2, read), []);
  assert.deepEqual(brandTierLabels('fr-FR', 3, read), [], 'liste incomplète : pas de libellés');
  assert.deepEqual(resolveTierLabels(['P'], { tierLabels: ['M'] }, brand), ['P']);
  assert.deepEqual(resolveTierLabels(undefined, { tierLabels: ['M'] }, brand), ['M']);
  assert.deepEqual(resolveTierLabels(undefined, { tierLabels: [] }, brand), brand);
  assert.equal(resolveTierLabels(undefined, { tierLabels: [] }, []), undefined);
  assert.equal(parseTierLabel('"é"'), 'é');
});
