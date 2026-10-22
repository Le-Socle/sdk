// La fusion de classes connaît les classes de jetons du SDK : la dernière gagne, sans garder les deux.
// Sans cette configuration, `cn("h-control-md", "h-control-lg")` garderait les deux classes et l'ordre
// des règles dans le CSS déciderait. Le test lit la source TypeScript compilée à la volée par Node.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Node 22 retire les types TypeScript d'un fichier .ts avec --experimental-strip-types.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-cn-'));
const script = path.join(dir, 'run.mjs');
fs.writeFileSync(
  script,
  `const { cn } = await import(${JSON.stringify(path.join(root, 'src/lib/cn.ts'))});
   console.log(JSON.stringify([
     cn('h-control-md', 'h-control-lg'),
     cn('min-h-control-md', 'min-h-row-double'),
     cn('rounded-md', 'rounded-detail'),
     cn('z-layer-menu', 'z-layer-tooltip'),
     cn('duration-fast', 'duration-slow'),
     cn('type-body', 'type-label'),
     cn('text-sm', 'type-label'),
     cn('shadow-1', 'shadow-3'),
     cn('px-2', 'px-4', 'text-primary', 'text-heading'),
   ]));`
);
const out = JSON.parse(
  execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', script], { cwd: root, encoding: 'utf8' })
);

test('cn : une hauteur de contrôle remplace l\u2019autre', () => assert.equal(out[0], 'h-control-lg'));
test('cn : une hauteur de ligne remplace l\u2019autre', () => assert.equal(out[1], 'min-h-row-double'));
test('cn : un rayon de jeton remplace l\u2019autre', () => assert.equal(out[2], 'rounded-detail'));
test('cn : une couche remplace l\u2019autre', () => assert.equal(out[3], 'z-layer-tooltip'));
test('cn : une durée de jeton remplace l\u2019autre', () => assert.equal(out[4], 'duration-slow'));
test('cn : un rôle typographique remplace l\u2019autre', () => assert.equal(out[5], 'type-label'));
test('cn : un rôle typographique remplace une taille de texte', () => assert.equal(out[6], 'type-label'));
test('cn : une ombre remplace l\u2019autre', () => assert.equal(out[7], 'shadow-3'));
test('cn : les classes sans conflit restent', () => assert.equal(out[8], 'px-4 text-heading'));
