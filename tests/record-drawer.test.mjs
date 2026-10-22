// Fiche latérale (issue #50) : cohérence de l'en-tête après le patch raté du lot 2b.
// Contrôle de source : le composant exige un fournisseur de données, un rendu serveur n'y suffirait pas.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/app/drawer/record-drawer.tsx'), 'utf8');

test('en-tête de la fiche : icône et titre dans la même ligne alignée', () => {
  const row = /<div className="flex items-center gap-2">\s*<Icon name=\{def\.icon\}[\s\S]*?<SheetTitle/.exec(src);
  assert.ok(row, 'icône puis titre dans un même conteneur flex items-center');
});

test('en-tête de la fiche : agrandir / réduire et fermer à droite, un seul bouton de fermeture', () => {
  assert.match(src, /Maximize2Icon/);
  assert.match(src, /Minimize2Icon/);
  assert.match(src, /<XIcon \/>/);
  assert.match(src, /showCloseButton=\{false\}/, 'la croix du volet est désactivée : la fiche a la sienne');
});

test('le volet n’a pas de ternaire sans effet sur sa taille', () => {
  assert.doesNotMatch(src, /\?\s*'wide'\s*:\s*'wide'/);
  assert.match(src, /size="wide"/);
});
