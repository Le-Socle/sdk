// Contrôle de format des jetons.
//
// 1. Terrazzo (l'outil retenu) lit toute la source : format DTCG 2025.10, types, alias, résolveur.
//    Une erreur d'analyse arrête le contrôle.
// 2. Règles du SDK, appliquées au résultat :
//    - trois couches : value.*, role.*, component.* et rien d'autre ;
//    - un composant lit un rôle (ou un autre composant), jamais une valeur ;
//    - un rôle lit une valeur ou un autre rôle, jamais un composant ;
//    - une valeur ne lit qu'une valeur ;
//    - chaque jeton a un $type ; chaque rôle et composant a une description ;
//    - les noms sont neutres : aucune teinte de marque (voir check-brands.mjs pour la recherche
//      dans tout le dépôt) ;
//    - chaque marque ne redéfinit que des jetons qui existent dans le thème neutre (une faute de
//      frappe ne crée pas un jeton orphelin), et le nombre de paliers de données est 4 ou 6, avec
//      autant de seuils que de paliers moins un.
//
// Usage : node scripts/check-tokens.mjs [--brands-dir chemin]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listBrands } from './lib/build-all.mjs';
import { layerOf, loadSystem } from './lib/tokens-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const brandsDir = args.includes('--brands-dir') ? path.resolve(args[args.indexOf('--brands-dir') + 1]) : path.join(root, 'brands');
const brands = listBrands(brandsDir);

const { resolver } = await loadSystem({
  tokensDir: path.join(root, 'tokens'),
  brands: Object.fromEntries(brands.map((b) => [b.id, path.join(b.dir, b.manifest.tokens ?? 'tokens.json')])),
});

const errors = [];
const err = (m) => errors.push(m);

const refsOf = (token) => {
  const out = [];
  const scan = (x) => {
    if (typeof x === 'string') {
      const m = /^\{(.+)\}$/.exec(x);
      if (m) out.push(m[1]);
    } else if (Array.isArray(x)) x.forEach(scan);
    else if (x && typeof x === 'object') Object.values(x).forEach(scan);
  };
  scan(token.originalValue?.$value);
  return out;
};

// Validation de structure des valeurs (Terrazzo laisse passer des composantes de couleur qui ne sont pas des nombres).
const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const dimOk = (d) => d && finite(d.value) && ['px', 'rem'].includes(d.unit);
function shapeError(t) {
  const v = t.$value;
  switch (t.$type) {
    case 'color': return v && Array.isArray(v.components) && v.components.length === 3 && v.components.every(finite) && (v.alpha === undefined || finite(v.alpha)) ? null : 'couleur : trois composantes numériques attendues';
    case 'dimension': return dimOk(v) ? null : 'dimension : { value: nombre, unit: "px" | "rem" } attendu';
    case 'duration': return v && finite(v.value) && ['ms', 's'].includes(v.unit) ? null : 'durée : { value, unit: "ms" | "s" } attendu';
    case 'number': case 'fontWeight': return finite(v) ? null : 'nombre attendu';
    case 'cubicBezier': return Array.isArray(v) && v.length === 4 && v.every(finite) ? null : 'courbe : quatre nombres attendus';
    case 'fontFamily': return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string') ? null : 'famille : liste de noms attendue';
    case 'shadow': return (Array.isArray(v) ? v : [v]).every((l) => l.color?.components?.every(finite) && [l.offsetX, l.offsetY, l.blur, l.spread].every(dimOk)) ? null : 'ombre : couleur, décalages, flou et étalement valides attendus';
    default: return null;
  }
}
for (const input of [{}, ...brands.map((b) => ({ brand: b.id }))]) {
  for (const [id, t] of Object.entries(resolver.apply(input))) {
    const e = shapeError(t);
    if (e) err(`${input.brand ? `marque ${input.brand} · ` : ''}${id} : ${e}`);
  }
}

const neutral = resolver.apply({});
const layers = new Set(['value', 'role', 'component']);
for (const [id, t] of Object.entries(neutral)) {
  const layer = layerOf(id);
  if (!layers.has(layer)) err(`${id} : hors des trois couches (value, role, component)`);
  if (!t.$type) err(`${id} : $type manquant`);
  if (layer !== 'value' && !t.$description && !/^role\.type\.[^.]+\.(size|leading|family|tracking)$/.test(id)) err(`${id} : description manquante`);
  for (const ref of refsOf(t)) {
    const rl = layerOf(ref);
    if (!neutral[ref]) {
      err(`${id} : alias inconnu {${ref}}`);
      continue;
    }
    if (layer === 'component' && rl === 'value') err(`${id} : un composant lit une valeur ({${ref}}) ; il doit lire un rôle`);
    if (layer === 'role' && rl === 'component') err(`${id} : un rôle lit un composant ({${ref}})`);
    if (layer === 'value' && rl !== 'value') err(`${id} : une valeur lit autre chose qu'une valeur ({${ref}})`);
  }
  // Un composant ne porte aucune valeur littérale de couleur ou de dimension.
  if (layer === 'component' && t.$type !== 'string' && refsOf(t).length === 0) err(`${id} : un composant doit être un alias`);
}

// Marques : chaque jeton redéfini existe dans le neutre ; échelle de données cohérente.
for (const b of brands) {
  const tokens = resolver.apply({ brand: b.id });
  for (const id of Object.keys(tokens)) if (!neutral[id]) err(`marque ${b.id} : le jeton ${id} n'existe pas dans le thème neutre`);
  const count = tokens['role.data.count']?.$value;
  if (count !== 4 && count !== 6) err(`marque ${b.id} : role.data.count doit valoir 4 ou 6 (valeur : ${count})`);
  const thresholds = Object.keys(tokens).filter((i) => /^role\.data\.threshold\.\d+$/.test(i));
  if (thresholds.length < count - 1) err(`marque ${b.id} : ${thresholds.length} seuils pour ${count} paliers (il en faut ${count - 1})`);
  const values = thresholds.slice(0, count - 1).map((i) => tokens[i].$value);
  if (values.some((v, i) => i > 0 && v <= values[i - 1])) err(`marque ${b.id} : les seuils doivent croître`);
}
const nCount = neutral['role.data.count']?.$value;
if (nCount !== 4 && nCount !== 6) err(`thème neutre : role.data.count doit valoir 4 ou 6`);

// Les modes ne définissent que des jetons existants.
for (const input of [{ mode: 'dark' }, { surface: 'dark' }, { surface: 'darker' }, { density: 'comfortable' }]) {
  for (const id of Object.keys(resolver.apply(input))) if (!neutral[id]) err(`${JSON.stringify(input)} : ${id} n'existe pas dans le thème neutre`);
}

console.log(`${Object.keys(neutral).length} jetons lus par Terrazzo (valeurs ${Object.keys(neutral).filter((i) => layerOf(i) === 'value').length}, rôles ${Object.keys(neutral).filter((i) => layerOf(i) === 'role').length}, composants ${Object.keys(neutral).filter((i) => layerOf(i) === 'component').length}) ; ${brands.length} marque(s) : ${brands.map((b) => b.id).join(', ') || 'aucune'}.`);
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :\n- ` + errors.slice(0, 60).join('\n- '));
  process.exit(1);
}
console.log('Format et règles des couches : conformes.');
