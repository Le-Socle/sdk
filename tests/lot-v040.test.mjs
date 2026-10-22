// Lot v0.4.0 : correctifs trouvés par la première marque branchée et par le lot 2b.
// Chaque test échouait avant son correctif (voir le message de commit).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildAll } from '../scripts/lib/build-all.mjs';
import { loadTs } from './lib/load-ts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-v040-'));
  for (const d of ['tokens', 'brands', 'fonts']) fs.cpSync(path.join(root, d), path.join(dir, d), { recursive: true });
  return dir;
};
const gen = (dir) => buildAll({ tokensDir: path.join(dir, 'tokens'), brandsDir: path.join(dir, 'brands'), fontsDir: path.join(dir, 'fonts'), genDir: path.join(dir, 'out'), typesImport: '../types' });

// ---- 1. chiffres tabulaires dans les utilitaires type-*
test('chaque utilitaire type-* écrit font-variant-numeric après font', async () => {
  const dir = sandbox();
  await gen(dir);
  const css = fs.readFileSync(path.join(dir, 'out/css/theme.css'), 'utf8');
  const blocks = [...css.matchAll(/@utility (type-[\w-]+) \{([^}]*)\}/g)];
  assert.ok(blocks.length >= 10, 'utilitaires type-* trouvés');
  for (const [, name, body] of blocks) {
    const iFont = body.indexOf('font:');
    const iNum = body.indexOf('font-variant-numeric: var(--numeric-tabular)');
    assert.ok(iFont >= 0 && iNum > iFont, `${name} : chiffres tabulaires après font`);
  }
});

// ---- 7. sorties arrondies
test('colorToCss : pas de rgb(0 28.9999 61.0001 / 0.08), les canaux sont arrondis au centième', async () => {
  const { colorToCss } = await import('../scripts/lib/tokens-core.mjs');
  const css = colorToCss({ colorSpace: 'srgb', components: [0, 28.9999 / 255, 61.0001 / 255], alpha: 0.08 });
  assert.equal(css, 'rgb(0 29 61 / 0.08)');
  assert.equal(colorToCss({ colorSpace: 'srgb', components: [0.5, 0.25, 1] }), 'rgb(127.5 63.75 255)');
});

// ---- 2. tierOf aux bornes
const scale4 = { count: 4, thresholds: [25, 50, 75] };
const scale6 = { count: 6, thresholds: [20, 30, 45, 60, 75] };

test('tierOf : 2,75 sur 5 donne 55,00000000000001 et reste du bon côté de la borne 45', async () => {
  const { tierOf } = await loadTs('src/ui/charts/scale.ts');
  const ratio = (2.75 / 5) * 100;
  assert.notEqual(ratio, 55, 'le flottant brut est bien faux (garde du test)');
  assert.equal(tierOf(ratio, scale6, true), tierOf(55, scale6, true));
  assert.equal(tierOf(ratio, scale6, true), 4);
});

test('tierOf : toutes les bornes, 4 et 6 paliers, avec et sans higherIsBetter', async () => {
  const { tierOf } = await loadTs('src/ui/charts/scale.ts');
  for (const scale of [scale4, scale6]) {
    scale.thresholds.forEach((t, i) => {
      // valeur exactement sur le seuil, atteinte par un calcul flottant comme dans les composants
      for (const max of [1, 3, 5, 7, 10, 100]) {
        const v = (t / 100) * max;
        assert.equal(tierOf((v / max) * 100, scale), i + 2, `seuil ${t}, max ${max}`);
        assert.equal(tierOf((v / max) * 100 - 0.01, scale), i + 1, `juste sous ${t}, max ${max}`);
        assert.equal(tierOf(((max - v) / max) * 100, scale, true), i + 2, `seuil ${t} inversé, max ${max}`);
      }
    });
  }
  // balayage : jamais de palier hors de 1..count, monotone
  for (const scale of [scale4, scale6]) {
    let prev = 1;
    for (let v = 0; v <= 100; v += 0.25) {
      const t = tierOf(v, scale);
      assert.ok(t >= prev && t <= scale.count);
      prev = t;
    }
  }
});
