#!/usr/bin/env node
// socle-brand : fabrique la feuille d'une marque qui vit hors du dépôt du SDK.
//
//   npx socle-brand build [dossier-de-la-marque] [--out dossier]
//
// Le dossier contient brand.json, tokens.json, fonts.json et fonts/ (voir la page « Créer une marque »).
// Par défaut : le dossier courant, sortie dans ./generated-brand. Le SDK installé suffit : la source
// de jetons (tokens/) et les polices du neutre (fonts/) sont dans le paquet.
//
// Sortie :
//   <out>/brands/<id>/brand.css, fonts.css, fonts/…   feuille de la marque (après tokens.css du SDK)
//   <out>/ts/<id>.ts                                    valeurs brutes TypeScript
//   <out>/dtcg/<id>.light.json, <id>.dark.json          JSON DTCG résolu
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './lib/build-all.mjs';

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const usage = 'Usage : socle-brand build [dossier-de-la-marque] [--out dossier]';

const cmd = args.shift();
if (cmd === '--help' || cmd === '-h' || cmd === undefined) {
  console.log(usage);
  process.exit(cmd === undefined ? 1 : 0);
}
if (cmd !== 'build') {
  console.error(`Commande inconnue : ${cmd}\n${usage}`);
  process.exit(1);
}

let brandDir = '.';
let outDir = 'generated-brand';
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--out') outDir = args[++i];
  else brandDir = args[i];
}
brandDir = path.resolve(brandDir);
outDir = path.resolve(outDir);

const manifestFile = path.join(brandDir, 'brand.json');
if (!fs.existsSync(manifestFile)) {
  console.error(`brand.json introuvable dans ${brandDir}.\n${usage}`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const id = manifest.id ?? path.basename(brandDir);

try {
  const { summary } = await buildAll({
    tokensDir: path.join(pkgRoot, 'tokens'),
    brandsDir: path.dirname(brandDir),
    brands: [{ id, dir: brandDir, manifest }],
    fontsDir: path.join(pkgRoot, 'fonts'),
    genDir: outDir,
    typesImport: '@le-socle/sdk/tokens',
    log: (m) => console.log(m),
  });
  console.log(`marque « ${id} » : ${summary.files.length} fichiers écrits dans ${outDir}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
