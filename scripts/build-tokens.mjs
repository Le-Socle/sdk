// Une commande, quatre sorties : `npm run tokens`.
//
//   1. variables CSS et thème Tailwind 4        → generated/css/, generated/brands/<id>/
//   2. valeurs brutes TypeScript               → generated/ts/ puis src/tokens/generated/
//   3. JSON DTCG résolu                        → generated/dtcg/
//
// Les sorties de generated/ sont recopiées là où le build de la bibliothèque les lit
// (src/tokens/generated pour le TypeScript). Le build du paquet lance cette commande.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './lib/build-all.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { summary, counts } = await buildAll({
  tokensDir: path.join(root, 'tokens'),
  brandsDir: path.join(root, 'brands'),
  fontsDir: path.join(root, 'fonts'),
  genDir: path.join(root, 'generated'),
  log: (m) => console.log(m),
});

// Le TypeScript est une source du paquet : tsc et vite le lisent dans src/.
const tsOut = path.join(root, 'src/tokens/generated');
fs.rmSync(tsOut, { recursive: true, force: true });
fs.mkdirSync(tsOut, { recursive: true });
for (const f of summary.files.filter((x) => x.startsWith('ts/'))) {
  const src = fs.readFileSync(path.join(root, 'generated', f), 'utf8').replace("'../../tokens/types'", "'../types'");
  fs.writeFileSync(path.join(tsOut, path.basename(f)), src);
}
console.log(`écrit ${summary.files.length} fichiers ; couches : ${JSON.stringify(counts)}`);
