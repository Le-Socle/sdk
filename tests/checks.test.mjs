// Les contrôles savent échouer : chacun est lancé sur un petit dépôt de test qui contient exactement
// la faute qu'il doit attraper. Un contrôle qui ne sait pas échouer ne prouve rien.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const run = (script, args, cwd = root) => spawnSync(node, [path.join(root, 'scripts', script), ...args], { cwd, encoding: 'utf8' });

function repo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-check-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  for (const [f, c] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), c);
  }
  return dir;
}

test('check-hardcoded : une couleur écrite en dur dans un composant échoue', () => {
  const dir = repo({ 'src/ui/bouton.tsx': 'export const B = () => <button style={{ color: "#ff0000" }}>x</button>;\n' });
  const r = run('check-hardcoded.mjs', ['--root', dir]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /couleur hexadécimale/);
});

test('check-hardcoded : rgb(), classe à valeur libre et durée en CSS échouent', () => {
  const dir = repo({
    'src/a.tsx': 'export const a = "w-[13px] bg-[rgb(1,2,3)]";\n',
    'src/b.css': '.x { transition: color 200ms; }\n',
  });
  const r = run('check-hardcoded.mjs', ['--root', dir]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /taille en classe libre/);
  assert.match(r.stdout, /durée littérale en CSS/);
});

test('check-hardcoded : un composant qui lit les jetons passe', () => {
  const dir = repo({
    'src/ui/bouton.tsx': 'export const B = () => <button className="bg-primary text-primary-foreground rounded-md p-4">x</button>;\n',
    'src/styles/a.css': '.x { color: var(--foreground); border: 1px solid var(--border); margin: 0; }\n',
  });
  const r = run('check-hardcoded.mjs', ['--root', dir]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('check-hardcoded : le dépôt du SDK est propre', () => {
  const r = run('check-hardcoded.mjs', []);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('check-brands : un nom de marque dans un fichier suivi échoue', () => {
  // le script lit le dépôt courant (cwd = racine du script) : on vérifie sa liste de mots sur un faux dépôt
  const src = fs.readFileSync(path.join(root, 'scripts/check-brands.mjs'), 'utf8');
  const dir = repo({ 'scripts/check-brands.mjs': src, 'src/a.ts': "export const couleur = 'prusse';\n", 'src/b.css': ':root { --x: #640D14; }\n' });
  const r = spawnSync(node, [path.join(dir, 'scripts/check-brands.mjs')], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /prusse/i);
  assert.match(r.stderr, /640D14/i);
});

test('check-brands : le dépôt du SDK ne contient aucun nom de marque', () => {
  const r = run('check-brands.mjs', []);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('check-tokens : une marque qui échoue (3 paliers) est refusée', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  fs.cpSync(path.join(root, 'brands'), dir, { recursive: true });
  const f = path.join(dir, 'demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.role.data.count.$value = 3;
  fs.writeFileSync(f, JSON.stringify(doc));
  const r = run('check-tokens.mjs', ['--brands-dir', dir]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /doit valoir 4 ou 6/);
});

test('check-tokens : un jeton de marque qui n\u2019existe pas dans le neutre est refusé', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  fs.cpSync(path.join(root, 'brands'), dir, { recursive: true });
  const f = path.join(dir, 'demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.role.coleur = { $type: 'color', $value: '{value.palette.white}', $description: 'faute de frappe' };
  fs.writeFileSync(f, JSON.stringify(doc));
  const r = run('check-tokens.mjs', ['--brands-dir', dir]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /role\.coleur/);
});

test('check-tokens : un format invalide est refusé par Terrazzo', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  fs.cpSync(path.join(root, 'brands'), dir, { recursive: true });
  const f = path.join(dir, 'demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.value.palette.primary['600'].$value = { colorSpace: 'oklch', components: ['pas', 'un', 'nombre'] };
  fs.writeFileSync(f, JSON.stringify(doc));
  const r = run('check-tokens.mjs', ['--brands-dir', dir]);
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
});

test('contrast-count : une marque au texte illisible est refusée', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-brand-'));
  fs.cpSync(path.join(root, 'brands'), dir, { recursive: true });
  const f = path.join(dir, 'demo/tokens.json');
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  // texte secondaire presque aussi clair que le fond
  doc.value.palette.neutral['600'].$value.components[0] = 0.9;
  fs.writeFileSync(f, JSON.stringify(doc));
  const r = run('contrast-count.mjs', ['--brands-dir', dir]);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /sous le seuil/);
});

test('check-mapping : toutes les variables d\u2019origine sont traitées', () => {
  const r = run('check-mapping.mjs', []);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /246 variables d'origine/);
});
