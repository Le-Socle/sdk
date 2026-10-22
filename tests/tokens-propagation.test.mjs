// Une valeur modifiée dans la source de jetons change les sorties (issue #8).
//
// Le test copie tokens/, brands/ et fonts/ dans un dossier temporaire, génère les sorties une fois
// telles quelles, change UNE valeur dans la source, regénère, et compare. Les sorties sont :
//   1. variables CSS (tokens.css) et thème Tailwind 4 (theme.css) ;
//   2. valeurs brutes TypeScript ;
//   3. JSON DTCG.
// Deux modifications : une couleur de palette (traverse les rôles et les composants par alias, donc
// tokens.css, TS et DTCG changent ; theme.css ne change pas, il ne contient que des var(), ce qui est
// voulu) et un point de rupture (seul littéral du thème : theme.css change).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildAll } from '../scripts/lib/build-all.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-tokens-'));
  for (const d of ['tokens', 'brands', 'fonts']) fs.cpSync(path.join(root, d), path.join(dir, d), { recursive: true });
  return dir;
}
const generate = (dir, name) =>
  buildAll({ tokensDir: path.join(dir, 'tokens'), brandsDir: path.join(dir, 'brands'), fontsDir: path.join(dir, 'fonts'), genDir: path.join(dir, name), typesImport: '../types' });
const read = (dir, name, rel) => fs.readFileSync(path.join(dir, name, rel), 'utf8');

test('une couleur de palette modifiée change le CSS, le TypeScript et le JSON DTCG', async () => {
  const dir = sandbox();
  await generate(dir, 'avant');
  const file = path.join(dir, 'tokens/value/color.tokens.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const before = doc.value.palette.primary['600'].$value.components[0];
  doc.value.palette.primary['600'].$value.components[0] = 0.33;
  assert.notEqual(before, 0.33);
  fs.writeFileSync(file, JSON.stringify(doc));
  await generate(dir, 'apres');

  const changed = (rel) => read(dir, 'avant', rel) !== read(dir, 'apres', rel);
  assert.ok(changed('css/tokens.css'), 'tokens.css doit changer');
  assert.ok(changed('ts/neutral.ts'), 'les valeurs TypeScript doivent changer');
  assert.ok(changed('dtcg/neutral.light.json'), 'le JSON DTCG clair doit changer');
  assert.ok(changed('dtcg/neutral.dark.json'), 'le JSON DTCG sombre doit changer');
  assert.ok(changed('ts/demo.ts') === false, 'la marque de démonstration ne dépend pas de la palette neutre');
  assert.ok(/--palette-primary-600: oklch\(0\.33 /.test(read(dir, 'apres', 'css/tokens.css')));
  assert.ok(!/--palette-primary-600: oklch\(0\.33 /.test(read(dir, 'avant', 'css/tokens.css')));
  // le rôle lit la valeur : l'alias est conservé, pas recopié
  assert.match(read(dir, 'apres', 'css/tokens.css'), /--color-action-base: var\(--palette-primary-600\)/);
  // la valeur brute du rôle suit
  const a = JSON.parse(read(dir, 'avant', 'dtcg/neutral.light.json'));
  const b = JSON.parse(read(dir, 'apres', 'dtcg/neutral.light.json'));
  assert.notDeepEqual(a.value.palette.primary['600'].$value, b.value.palette.primary['600'].$value);
  assert.equal(b.role.color.action.base.$value, '{value.palette.primary.600}');
});

test('une couleur de la marque de démonstration modifiée change sa feuille, ses valeurs brutes et son JSON, pas le neutre', async () => {
  const dir = sandbox();
  await generate(dir, 'avant');
  const file = path.join(dir, 'brands/demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  doc.value.palette.primary['600'].$value.components[2] = 200;
  fs.writeFileSync(file, JSON.stringify(doc));
  await generate(dir, 'apres');
  const changed = (rel) => read(dir, 'avant', rel) !== read(dir, 'apres', rel);
  assert.ok(changed('brands/demo/brand.css'));
  assert.ok(changed('ts/demo.ts'));
  assert.ok(changed('dtcg/demo.light.json'));
  assert.ok(!changed('css/tokens.css'), 'le thème neutre ne bouge pas');
  assert.ok(!changed('ts/neutral.ts'));
});

test('un point de rupture modifié change le thème Tailwind', async () => {
  const dir = sandbox();
  await generate(dir, 'avant');
  const file = path.join(dir, 'tokens/role/structure.tokens.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  doc.role.breakpoint.md.$value.value = 52;
  fs.writeFileSync(file, JSON.stringify(doc));
  await generate(dir, 'apres');
  assert.notEqual(read(dir, 'avant', 'css/theme.css'), read(dir, 'apres', 'css/theme.css'), 'theme.css doit changer');
  assert.match(read(dir, 'apres', 'css/theme.css'), /--breakpoint-md:\s+52rem/);
  assert.notEqual(read(dir, 'avant', 'css/tokens.css'), read(dir, 'apres', 'css/tokens.css'));
  assert.notEqual(read(dir, 'avant', 'ts/neutral.ts'), read(dir, 'apres', 'ts/neutral.ts'));
});

test('quatre ou six paliers de données : le nombre se change dans la source de la marque, sans toucher un composant', async () => {
  const dir = sandbox();
  await generate(dir, 'avant');
  const file = path.join(dir, 'brands/demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(doc.role.data.count.$value, 6);
  doc.role.data.count.$value = 4;
  fs.writeFileSync(file, JSON.stringify(doc));
  await generate(dir, 'apres');
  assert.match(read(dir, 'avant', 'brands/demo/brand.css'), /--data-count: 6/);
  // à 4 paliers la marque égale le neutre sur ce jeton : plus rien à redéclarer, le JSON DTCG porte la valeur
  assert.ok(!/--data-count/.test(read(dir, 'apres', 'brands/demo/brand.css')));
  assert.equal(JSON.parse(read(dir, 'avant', 'dtcg/demo.light.json')).role.data.count.$value, 6);
  assert.equal(JSON.parse(read(dir, 'apres', 'dtcg/demo.light.json')).role.data.count.$value, 4);
  // les jetons de composant et le thème Tailwind sont identiques : aucun composant n'est touché
  assert.equal(read(dir, 'avant', 'css/theme.css'), read(dir, 'apres', 'css/theme.css'));
  assert.equal(read(dir, 'avant', 'css/tokens.css'), read(dir, 'apres', 'css/tokens.css'));
});

test('les sorties de la marque neutre ne contiennent aucune police distante', async () => {
  const dir = sandbox();
  await generate(dir, 'sortie');
  for (const f of ['css/fonts.css', 'brands/demo/fonts.css', 'css/tokens.css', 'brands/demo/brand.css']) {
    const text = read(dir, 'sortie', f);
    assert.ok(!/https?:\/\//.test(text), `${f} contient une URL distante`);
    assert.ok(!/googleapis|gstatic/.test(text), `${f} appelle un service de polices tiers`);
  }
});
