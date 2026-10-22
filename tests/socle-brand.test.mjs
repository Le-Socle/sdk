// socle-brand : une marque hors du dépôt génère sa feuille avec le seul contenu du paquet npm.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('package.json : bin socle-brand et fichiers de la chaîne de génération publiés', () => {
  assert.equal(pkg.bin?.['socle-brand'], './scripts/socle-brand.mjs');
  for (const f of ['tokens', 'fonts', 'scripts/lib', 'scripts/socle-brand.mjs']) assert.ok(pkg.files.includes(f), f);
  assert.ok(pkg.dependencies['@terrazzo/parser'] && pkg.dependencies['colorjs.io'], 'dépendances d’exécution de la chaîne');
});

test('socle-brand build : une copie de brands/demo hors du dépôt produit sa feuille', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  const brand = path.join(dir, 'ma-marque');
  fs.cpSync(path.join(root, 'brands/demo'), brand, { recursive: true });
  const out = path.join(dir, 'sortie');
  execFileSync(process.execPath, [path.join(root, 'scripts/socle-brand.mjs'), 'build', brand, '--out', out], { cwd: dir, encoding: 'utf8' });
  for (const f of ['brand.css', 'fonts.css']) assert.ok(fs.existsSync(path.join(out, 'brands/demo', f)), f);
  assert.ok(fs.existsSync(path.join(out, 'ts/demo.ts')));
  assert.ok(fs.existsSync(path.join(out, 'dtcg/demo.light.json')));
});

test('socle-brand build : message clair sans brand.json', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  assert.throws(
    () => execFileSync(process.execPath, [path.join(root, 'scripts/socle-brand.mjs'), 'build', dir], { encoding: 'utf8', stdio: 'pipe' }),
    (e) => /brand\.json introuvable/.test(String(e.stderr))
  );
});
