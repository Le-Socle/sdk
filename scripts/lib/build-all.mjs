// Orchestration de la chaîne de jetons : une commande, quatre sorties, pour le thème
// neutre du SDK et pour chaque marque (brands/<id>/brand.json).
//
//   css/tokens.css, css/theme.css, css/fonts.css     variables CSS et thème Tailwind 4
//   ts/<marque>.ts                                    valeurs brutes TypeScript
//   dtcg/<marque>.<mode>.json                         JSON au format DTCG 2025.10, résolu
//   brands/<id>/brand.css, fonts.css, fonts/…         feuille de marque (passe après tokens.css)
//
// Tout part de tokens/ et de brands/. Rien n'est écrit ailleurs que dans `genDir`.
import fs from 'node:fs';
import path from 'node:path';
import { emitCss, emitDtcg, emitIndex, emitTheme, emitTs, loadSystem, tokenSummary } from './tokens-core.mjs';
import { emitFontsCss, readFonts } from './fonts.mjs';

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function listBrands(brandsDir) {
  if (!fs.existsSync(brandsDir)) return [];
  return fs
    .readdirSync(brandsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(brandsDir, e.name, 'brand.json')))
    .map((e) => ({ id: e.name, dir: path.join(brandsDir, e.name), manifest: JSON.parse(fs.readFileSync(path.join(brandsDir, e.name, 'brand.json'), 'utf8')) }));
}

/** @param {{ tokensDir: string, brandsDir: string, fontsDir: string, genDir: string, typesImport?: string, log?: (m: string) => void }} o */
export async function buildAll(o) {
  const log = o.log ?? (() => {});
  const brands = listBrands(o.brandsDir);
  const brandFiles = Object.fromEntries(brands.map((b) => [b.id, path.join(b.dir, b.manifest.tokens ?? 'tokens.json')]));
  const { resolver } = await loadSystem({ tokensDir: o.tokensDir, brands: brandFiles });
  const summary = { brands: brands.map((b) => b.id), files: [] };
  const out = (rel, content) => {
    write(path.join(o.genDir, rel), content);
    summary.files.push(rel);
  };

  // --- marque neutre : polices, CSS, thème, TS, DTCG
  const neutralFonts = readFonts({ manifestFile: path.join(o.fontsDir, 'fonts.json'), baseDir: o.fontsDir });
  out('css/tokens.css', emitCss({ resolver }));
  out('css/theme.css', emitTheme({ resolver }));
  out('css/fonts.css', emitFontsCss(neutralFonts, { urlPrefix: '../fonts/' }));
  for (const f of neutralFonts.files) {
    fs.mkdirSync(path.join(o.genDir, 'fonts', path.dirname(f.rel)), { recursive: true });
    fs.copyFileSync(f.abs, path.join(o.genDir, 'fonts', f.rel));
  }
  const modes = [['light', {}], ['dark', { mode: 'dark' }]];
  const typesImport = o.typesImport ?? '../../tokens/types';
  const ts = emitTs({ resolver, fonts: neutralFonts.exported, typesImport });
  out('ts/neutral.ts', ts.source);
  for (const [name, input] of modes) out(`dtcg/neutral.${name}.json`, JSON.stringify(emitDtcg(resolver.apply(input)), null, 2) + '\n');
  out('tokens-index.json', JSON.stringify(emitIndex({ resolver })) + '\n');
  const counts = tokenSummary(resolver.apply({}));

  // --- chaque marque
  for (const b of brands) {
    const fonts = readFonts({ manifestFile: path.join(b.dir, 'fonts.json'), baseDir: path.join(b.dir, 'fonts') });
    out(`brands/${b.id}/brand.css`, `@import "./fonts.css";\n\n${emitCss({ resolver, brand: b.id })}`);
    out(`brands/${b.id}/fonts.css`, emitFontsCss(fonts, { urlPrefix: './fonts/' }));
    for (const f of fonts.files) {
      fs.mkdirSync(path.join(o.genDir, 'brands', b.id, 'fonts', path.dirname(f.rel)), { recursive: true });
      fs.copyFileSync(f.abs, path.join(o.genDir, 'brands', b.id, 'fonts', f.rel));
    }
    out(`ts/${b.id}.ts`, emitTs({ resolver, brand: b.id, fonts: fonts.exported, typesImport }).source);
    for (const [name, input] of modes) out(`dtcg/${b.id}.${name}.json`, JSON.stringify(emitDtcg(resolver.apply({ brand: b.id, ...input })), null, 2) + '\n');
    log(`marque ${b.id} : ${Object.keys(resolver.apply({ brand: b.id })).length} jetons`);
  }
  out('manifest.json', JSON.stringify({ brands: summary.brands, counts, files: summary.files.filter((f) => f !== 'manifest.json') }, null, 2) + '\n');
  log(`jetons : ${JSON.stringify(counts)} ; ${summary.files.length} fichiers dans ${o.genDir}`);
  return { resolver, summary, counts };
}
