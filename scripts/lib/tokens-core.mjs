// Cœur de la chaîne de jetons : lit la source DTCG 2025.10 avec Terrazzo (analyse,
// validation, résolveur), puis émet quatre sorties :
//   1. variables CSS (tokens.css) et thème Tailwind 4 (theme.css) ;
//   2. valeurs brutes en TypeScript ;
//   3. JSON au format DTCG, résolu, un fichier par marque et par mode.
// Le choix de l'outil est argumenté dans docs/decisions/jetons-outil.md.
//
// Ce fichier ne contient aucune valeur de marque : il traduit ce que les fichiers
// de jetons déclarent.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, parse } from '@terrazzo/parser';
import Color from 'colorjs.io';

export const EXT = 'org.le-socle';
const CONTEXT_AXES = ['brand', 'mode', 'surface', 'density'];

// ---------------------------------------------------------------- lecture et résolveur

/** Lit le résolveur du SDK. `brands` : { nom: chemin du fichier de jetons } remplace le
 * modificateur « brand » (le SDK seul : la marque de démonstration ; un paquet de marque :
 * la sienne). Tous les $ref deviennent absolus pour que la source puisse vivre ailleurs. */
export async function loadSystem({ tokensDir, brands }) {
  const resolverPath = path.join(tokensDir, 'system.resolver.json');
  const doc = JSON.parse(fs.readFileSync(resolverPath, 'utf8'));
  const abs = (ref) => ({ $ref: pathToFileURL(path.resolve(tokensDir, ref.$ref)).href });
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      if (typeof node.$ref === 'string' && !node.$ref.startsWith('#')) return abs(node);
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]));
    }
    return node;
  };
  const resolved = walk(doc);
  if (brands) {
    resolved.modifiers.brand.contexts = { neutral: [] };
    for (const [name, file] of Object.entries(brands)) {
      resolved.modifiers.brand.contexts[name] = [{ $ref: pathToFileURL(path.resolve(file)).href }];
    }
  }
  const config = defineConfig({}, { cwd: pathToFileURL(path.resolve(tokensDir) + path.sep) });
  const filename = pathToFileURL(resolverPath);
  const result = await parse([{ filename, src: JSON.stringify(resolved) }], { config });
  if (!result.resolver) throw new Error('Terrazzo n\u2019a pas trouvé le résolveur dans ' + resolverPath);
  return { resolver: result.resolver, brandNames: Object.keys(resolved.modifiers.brand.contexts) };
}

export function applyContext(resolver, input) {
  return resolver.apply(input);
}

// ---------------------------------------------------------------- noms

const SKIP_CSS = (id) => /^role\.type\.[^.]+\.(caps|tabular)$/.test(id);

/** Nom de la variable CSS d'un jeton. Les noms sont neutres ; voir docs/correspondance-jetons.md. */
export function cssName(token) {
  const id = token.id;
  const p = id.split('.');
  const rest = (n) => p.slice(n).join('-');
  // La couche de base reprend les noms sans préfixe que shadcn/ui attend (--background, --primary...).
  if (id.startsWith('component.base.')) return `--${rest(2)}`;
  if (p[0] === 'value') {
    switch (p[1]) {
      case 'palette': return `--palette-${rest(2)}`;
      case 'font': {
        const map = { family: 'font', size: 'text', weight: 'weight', leading: 'leading', tracking: 'tracking', numeric: 'numeric' };
        return `--${map[p[2]]}-${rest(3)}`;
      }
      case 'space': return `--space-${rest(2)}`;
      case 'motion': return p[2] === 'stagger' ? '--stagger' : `--${p[2]}-${rest(3)}`;
    }
  }
  if (p[0] === 'role') {
    switch (p[1]) {
      case 'color': return `--color-${rest(2)}`;
      case 'type': return `--type-${rest(2)}`;
      case 'data': return `--data-${rest(2)}`;
      default: return `--${rest(1)}`;
    }
  }
  if (p[0] === 'component') return `--${rest(1)}`;
  throw new Error(`Jeton hors des trois couches : ${id}`);
}

export function layerOf(id) {
  return id.split('.')[0];
}

// ---------------------------------------------------------------- valeurs

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', '-apple-system', 'emoji', 'math']);
const num = (n) => String(Math.round(n * 10000) / 10000);

function quoteFamily(f) {
  return GENERIC.has(f) || /^[A-Za-z][A-Za-z-]*$/.test(f) ? f : `"${f}"`;
}

function colorToCss(v) {
  const a = v.alpha ?? 1;
  const alpha = a === 1 ? '' : ` / ${num(a)}`;
  const [c1, c2, c3] = v.components;
  if (v.colorSpace === 'oklch') return `oklch(${num(c1)} ${num(c2)} ${num(c3)}${alpha})`;
  if (v.colorSpace === 'srgb') {
    if (v.hex && a === 1) return v.hex.toLowerCase();
    return `rgb(${num(c1 * 255)} ${num(c2 * 255)} ${num(c3 * 255)}${alpha})`;
  }
  return `color(${v.colorSpace} ${v.components.map(num).join(' ')}${alpha})`;
}

/** Valeur CSS d'un jeton, avec ses alias laissés en var(--nom) : les couches restent liées. */
export function cssValue(token, byId) {
  const orig = token.originalValue?.$value;
  const aliasRef = (s) => {
    const m = typeof s === 'string' && /^\{(.+)\}$/.exec(s);
    return m ? `var(${cssName(byId[m[1]] ?? (() => { throw new Error(`Alias inconnu : ${m[1]} (dans ${token.id})`); })())})` : null;
  };
  const whole = aliasRef(orig);
  if (whole) return whole;
  const type = token.$type;
  const ext = token.$extensions?.[EXT];
  const v = token.$value;
  switch (type) {
    case 'color': return colorToCss(v);
    case 'dimension': {
      if (ext?.fluid) return `clamp(${v0(ext.fluid.min)}, ${ext.fluid.preferred}, ${v0(v)})`;
      return v0(v);
    }
    case 'duration': return v0(v);
    case 'number': return `${num(v)}${ext?.unit ?? ''}`;
    case 'fontWeight': return String(v);
    case 'fontFamily': return v.map(quoteFamily).join(', ');
    case 'cubicBezier': return `cubic-bezier(${v.map(num).join(', ')})`;
    case 'string': return String(v);
    case 'shadow': {
      const layers = Array.isArray(v) ? v : [v];
      const origLayers = Array.isArray(orig) ? orig : [orig];
      return layers.map((l, i) => {
        const o = origLayers[i] ?? {};
        const col = aliasRef(o.color) ?? colorToCss(l.color);
        return [l.inset ? 'inset' : null, v0(l.offsetX), v0(l.offsetY), v0(l.blur), v0(l.spread), col].filter(Boolean).join(' ');
      }).join(', ');
    }
    default: throw new Error(`Type de jeton non pris en charge : ${type} (${token.id})`);
  }
}
function v0(d) {
  return `${num(d.value)}${d.unit}`;
}

/** Dépendances directes (alias entiers ou dans un composite). */
function dependencies(token) {
  const out = new Set();
  const scan = (x) => {
    if (typeof x === 'string') {
      const m = /^\{(.+)\}$/.exec(x);
      if (m) out.add(m[1]);
    } else if (Array.isArray(x)) x.forEach(scan);
    else if (x && typeof x === 'object') Object.values(x).forEach(scan);
  };
  scan(token.originalValue?.$value);
  return out;
}

// ---------------------------------------------------------------- CSS

const LAYER_TITLE = {
  value: 'COUCHE 1 · VALEURS (palette, typographie, espacements, mouvement)',
  role: 'COUCHE 2 · RÔLES (ce que les composants lisent)',
  component: 'COUCHE 3 · COMPOSANTS (un composant lit un rôle, jamais une valeur)',
};

const LAYER_ORDER = { value: 0, role: 1, component: 2 };

function declarations(ids, tokens, byId, indent = '  ') {
  const lines = [];
  let layer = null;
  const sorted = [...ids].sort((a, b) => LAYER_ORDER[layerOf(a)] - LAYER_ORDER[layerOf(b)]);
  for (const id of sorted) {
    const t = tokens[id];
    if (!t || SKIP_CSS(id)) continue;
    if (layerOf(id) !== layer) {
      layer = layerOf(id);
      if (lines.length) lines.push('');
      lines.push(`${indent}/* ${LAYER_TITLE[layer]} */`);
    }
    const note = t.$description ? ` /* ${t.$description.replace(/\*\//g, '* /')} */` : '';
    lines.push(`${indent}${cssName(t)}: ${cssValue(t, byId)};${note}`);
  }
  return lines;
}

/** Jetons dont le CSS diffère entre deux contextes. */
function changed(base, target, byIdTarget) {
  const ids = [];
  for (const id of Object.keys(target)) {
    if (SKIP_CSS(id)) continue;
    if (!base[id] || cssValue(base[id], byIdOf(base)) !== cssValue(target[id], byIdTarget)) ids.push(id);
  }
  return ids;
}
const byIdCache = new WeakMap();
function byIdOf(tokens) {
  if (!byIdCache.has(tokens)) byIdCache.set(tokens, tokens);
  return tokens;
}

/** Ajoute les jetons qui lisent (de près ou de loin) un des jetons changés : une variable
 * déclarée plus haut est calculée là où elle est déclarée, donc un bloc posé sur un
 * élément intérieur doit redéclarer ses dépendants. */
function withDependents(ids, tokens) {
  const readers = new Map();
  for (const [id, t] of Object.entries(tokens)) {
    for (const d of dependencies(t)) {
      if (!readers.has(d)) readers.set(d, new Set());
      readers.get(d).add(id);
    }
  }
  const out = new Set(ids);
  const queue = [...ids];
  while (queue.length) {
    const id = queue.pop();
    for (const r of readers.get(id) ?? []) {
      if (!out.has(r)) {
        out.add(r);
        queue.push(r);
      }
    }
  }
  return Object.keys(tokens).filter((id) => out.has(id));
}

function block(selector, lines, comment) {
  const head = comment ? `/* ${comment} */\n` : '';
  return `${head}${selector} {\n${lines.join('\n')}\n}\n`;
}

const HEADER = (what) => `/* ============================================================================
   GÉNÉRÉ par scripts/build-tokens.mjs depuis tokens/ (DTCG 2025.10). Ne pas éditer.
   ${what}
   ============================================================================ */\n`;

const DARK_SELECTOR = ':root[data-theme="dark"],\n[data-theme="dark"]';

/** tokens.css du SDK (marque neutre) ou feuille d'une marque (brand : nom du contexte).
 *
 * Pourquoi les sélecteurs sombres sont doublés (:root[data-theme="dark"]) : la feuille d'une
 * marque passe après celle du SDK et redéclare des variables sur :root. À spécificité égale elle
 * l'emporterait aussi en thème sombre. Le sélecteur doublé (0,2,0) garde le thème sombre du SDK
 * au-dessus du :root de la marque, et la marque pose son propre sombre avec le même sélecteur.
 *
 * Pourquoi les blocs redéclarent les jetons qui lisent ceux qu'ils changent : une variable
 * déclarée sur :root avec var() est calculée sur :root. Un élément intérieur (data-theme ou
 * data-surface posé sur une section) qui ne redéclarerait que le rôle hériterait de la valeur
 * déjà calculée du composant. */
export function emitCss({ resolver, brand }) {
  const R = (input) => resolver.apply(input);
  const parts = [];
  const neutral = R({});
  if (!brand) {
    parts.push(HEADER(`Variables CSS du SDK, marque neutre. Thème clair par défaut ; sombre : [data-theme="dark"] ;
   sections sombres : [data-surface="dark" | "darker"] ; densité : [data-density="comfortable"].`));
    const ids = Object.keys(neutral).filter((id) => !SKIP_CSS(id) && !id.startsWith('role.breakpoint.'));
    parts.push(block(':root', ['  color-scheme: light;', ...declarations(ids, neutral, neutral)]));
  } else {
    const comment = `Marque « ${brand} » : ne contient que ce que la marque change par rapport au thème neutre.`;
    parts.push(HEADER(`${comment}\n   À charger APRÈS tokens.css du SDK.`));
    const t0 = R({ brand });
    const rootIds = changed(neutral, t0, t0).filter((id) => !id.startsWith('role.breakpoint.'));
    parts.push(block(':root', declarations(rootIds, t0, t0), comment));
    const dN = R({ mode: 'dark' });
    const dB = R({ brand, mode: 'dark' });
    const darkIds = withDependents(changed(dN, dB, dB), dB).filter((id) => !SKIP_CSS(id));
    if (darkIds.length) parts.push(block(DARK_SELECTOR, declarations(darkIds, dB, dB), 'Thème sombre de la marque.'));
    for (const s of ['dark', 'darker']) {
      const sN = R({ surface: s });
      const sB = R({ brand, surface: s });
      const ids = withDependents(changed(sN, sB, sB), sB);
      if (ids.length) parts.push(block(`[data-surface="${s}"]`, declarations(ids, sB, sB), `Surface « ${s} » de la marque.`));
    }
    const cN = R({ density: 'comfortable' });
    const cB = R({ brand, density: 'comfortable' });
    const cIds = changed(cN, cB, cB);
    if (cIds.length) parts.push(block('[data-density="comfortable"]', declarations(cIds, cB, cB), 'Densité confortable de la marque.'));
    return parts.join('\n');
  }

  // Thème sombre complet : activable par data-theme="dark" sur n'importe quel élément.
  const dark = R({ mode: 'dark' });
  let ids = withDependents(changed(neutral, dark, dark), dark).filter((id) => !SKIP_CSS(id));
  parts.push(block(DARK_SELECTOR, ['  color-scheme: dark;', ...declarations(ids, dark, dark)], 'Thème sombre complet (rôles remappés).'));
  // Surfaces sombres : une section remappe les composants, les rôles restent.
  for (const [s, note] of [['dark', 'Section sombre.'], ['darker', 'Section la plus sombre : couverture, pied de page.']]) {
    const t = R({ surface: s });
    ids = withDependents(changed(neutral, t, t), t);
    parts.push(block(`[data-surface="${s}"]`, [...declarations(ids, t, t), '  background-color: var(--background);', '  color: var(--foreground);'], `${note} Les composants lisent les mêmes noms ; seuls les jetons de composant sont remappés.`));
  }
  // Densité.
  const comf = R({ density: 'comfortable' });
  ids = changed(neutral, comf, comf);
  parts.push(block('[data-density="comfortable"]', declarations(ids, comf, comf), 'Densité confortable ; la compacte est celle par défaut.'));
  // Pointeur grossier : tout contrôle prend la cible tactile.
  const coarse = Object.values(neutral).filter((t) => t.$extensions?.[EXT]?.coarse);
  if (coarse.length) {
    const lines = coarse.map((t) => `    ${cssName(t)}: var(${cssName(neutral[t.$extensions[EXT].coarse.slice(1, -1)])});`);
    parts.push(`/* Pointeur grossier (le doigt) : cible tactile. */\n@media (pointer: coarse) {\n  :root,\n  [data-density] {\n${lines.join('\n')}\n  }\n}\n`);
  }
  // Mouvement réduit.
  const reduced = Object.values(neutral).filter((t) => t.$extensions?.[EXT]?.reducedMotion);
  if (reduced.length) {
    const lines = reduced.map((t) => `    ${cssName(t)}: ${v0(t.$extensions[EXT].reducedMotion)};`);
    parts.push(`/* Réglage « réduire les animations » : les durées de déplacement tombent à 0,01 ms (l'événement de fin de transition part quand même) ; micro et fast restent. */\n@media (prefers-reduced-motion: reduce) {\n  :root {\n${lines.join('\n')}\n  }\n}\n`);
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------- thème Tailwind 4

const pad = (s, n = 38) => s.padEnd(n, ' ');

/** Registre de thème Tailwind 4 (« reference inline ») : Tailwind nomme ses utilitaires
 * d'après ces clés et y inscrit var(--…), sans émettre de variable (aucune déclaration en
 * double). Seuls les points de rupture sont des littéraux : une clé de breakpoint ne peut
 * pas lire une variable. */
export function emitTheme({ resolver }) {
  const t = resolver.apply({});
  const all = Object.values(t);
  const L = [];
  const decl = (k, v) => `  ${pad(`${k}:`)} ${v};`;
  const base = all.filter((x) => x.id.startsWith('component.base.') && x.id !== 'component.base.radius');
  L.push('  /* Vocabulaire de shadcn/ui : --color-<nom> lit --<nom>, défini par la couche des composants. */');
  for (const x of base) {
    const n = cssName(x).slice(2);
    L.push(decl(`--color-${n}`, `var(--${n})`));
  }
  L.push('');
  L.push('  /* Rôles : --color-<rôle> lit lui-même, tel que tokens.css le déclare. */');
  const roleNames = all.filter((x) => x.id.startsWith('role.color.')).map((x) => cssName(x));
  const shadcn = new Set(base.map((x) => `--color-${cssName(x).slice(2)}`));
  for (const n of roleNames) if (!shadcn.has(n)) L.push(decl(n, `var(${n})`));
  L.push('');
  L.push('  /* Rayons, ombres, courbes. */');
  for (const x of all.filter((y) => y.id.startsWith('role.radius.'))) L.push(decl(cssName(x), `var(${cssName(x)})`));
  for (const x of all.filter((y) => y.id.startsWith('role.shadow.'))) L.push(decl(cssName(x), `var(${cssName(x)})`));
  for (const x of all.filter((y) => y.id.startsWith('value.motion.ease.'))) L.push(decl(cssName(x), `var(${cssName(x)})`));
  L.push('');
  L.push('  /* Familles de police. font-heading et font-sans sont les noms que shadcn et Tailwind attendent. */');
  for (const x of all.filter((y) => y.id.startsWith('value.font.family.'))) L.push(decl(cssName(x), `var(${cssName(x)})`));
  L.push(decl('--font-sans', 'var(--font-text)'));
  L.push('');
  L.push('  /* Graisses : font-light, font-normal, font-medium, font-semibold. Pas de font-bold : le gras est réservé aux titres. */');
  for (const x of all.filter((y) => y.id.startsWith('value.font.weight.'))) {
    const short = x.id.split('.').pop();
    L.push(decl(`--font-weight-${short === 'regular' ? 'normal' : short}`, `var(${cssName(x)})`));
  }
  L.push('');
  L.push('  /* Interlignes et interlettrages. */');
  for (const x of all.filter((y) => /^value\.font\.(leading|tracking)\./.test(y.id))) L.push(decl(cssName(x), `var(${cssName(x)})`));
  L.push('');
  L.push('  /* Espacements : la base de 4 px. p-4, gap-6, h-11 en découlent. */');
  L.push(decl('--spacing', 'var(--space-1)'));
  L.push('');
  L.push('  /* Largeur de page : max-w-page. */');
  L.push(decl('--container-page', 'var(--container-page)'));
  L.push('');
  L.push('  /* Hauteurs de contrôle et de ligne : suivent la densité et le pointeur sans qu\'un composant écrive un nombre. */');
  for (const x of all.filter((y) => /^role\.(control|row)\./.test(y.id))) {
    L.push(decl(`--height-${cssName(x).slice(2)}`, `var(${cssName(x)})`));
    L.push(decl(`--min-height-${cssName(x).slice(2)}`, `var(${cssName(x)})`));
  }
  L.push('');
  L.push('  /* Couches d\'empilement : z-layer-sticky, z-layer-menu, z-layer-tooltip. */');
  for (const x of all.filter((y) => y.id.startsWith('role.layer.'))) L.push(decl(`--z-index-${cssName(x).slice(2)}`, `var(${cssName(x)})`));
  L.push('');
  L.push('  /* Points de rupture : littéraux (une clé de breakpoint ne peut pas lire une variable), tirés des jetons role.breakpoint.*. */');
  for (const x of all.filter((y) => y.id.startsWith('role.breakpoint.'))) L.push(decl(cssName(x), cssValue(x, t)));
  L.push('');
  L.push('  /* Réglages par défaut de Tailwind qui portent une durée, une courbe ou une police. */');
  L.push(decl('--default-font-family', 'var(--font-text)'));
  L.push(decl('--default-transition-duration', 'var(--duration-fast)'));
  L.push(decl('--default-transition-timing-function', 'var(--ease-out)'));

  // Rôles typographiques : type-<rôle>.
  const typeRoles = [...new Set(all.filter((x) => x.id.startsWith('role.type.')).map((x) => x.id.split('.')[2]))];
  const util = typeRoles.map((r) => {
    const get = (p) => t[`role.type.${r}.${p}`];
    const body = [`  font: var(--type-${r}-weight) var(--type-${r}-size)/var(--type-${r}-leading) var(--type-${r}-family);`];
    if (get('tracking')) body.push(`  letter-spacing: var(--type-${r}-tracking);`);
    if (get('caps')) body.push('  text-transform: uppercase;');
    if (get('tabular')) body.push('  font-variant-numeric: var(--numeric-tabular);');
    const d = get('weight')?.$description;
    return `${d ? `/* ${d} */\n` : ''}@utility type-${r} {\n${body.join('\n')}\n}`;
  });
  const durations = all.filter((x) => x.id.startsWith('value.motion.duration.')).map((x) => {
    const n = cssName(x);
    return `${x.$description ? `/* ${x.$description} */\n` : ''}@utility ${n.slice(2)} {\n  --tw-duration: var(${n});\n  transition-duration: var(${n});\n}`;
  });
  return `${HEADER('Registre de thème Tailwind 4, lu depuis tokens/. À importer après tokens.css.')}
@theme reference inline {
${L.join('\n')}
}

/* Rôles typographiques : type-<rôle> pose la police, la taille, l'interligne, la graisse,
   l'interlettrage et, selon le rôle, les capitales ou les chiffres tabulaires. C'est la
   seule façon d'écrire du texte dans un composant : aucune taille en dur n'est enregistrée. */

${util.join('\n\n')}

/* Durées de mouvement : une classe par jeton. */

${durations.join('\n\n')}

/* Anneau de focus : visible au clavier seulement (focus-visible), jamais animé. */
@utility focus-ring {
  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--ring);
    outline-offset: var(--focus-ring-offset);
  }
}

/* Appui : le contrôle rentre de 3 % pendant le clic ; sans mouvement si l'utilisateur le demande. */
@utility press {
  &:active {
    transform: scale(0.97);
  }
  @media (prefers-reduced-motion: reduce) {
    &:active {
      transform: none;
    }
  }
}
`;
}

// ---------------------------------------------------------------- valeurs brutes (TypeScript)

function toRaw(token) {
  const v = token.$value;
  switch (token.$type) {
    case 'color': return colorToHex(v);
    case 'dimension': {
      const px = v.unit === 'rem' ? v.value * 16 : v.value;
      if (v.unit !== 'px' && v.unit !== 'rem') throw new Error(`Unité non convertie en px : ${v.unit} (${token.id})`);
      return Math.round(px * 100) / 100;
    }
    case 'duration': return v.unit === 's' ? v.value * 1000 : v.value;
    case 'shadow': return (Array.isArray(v) ? v : [v]).map((l) => `${l.inset ? 'inset ' : ''}${Math.round(l.offsetX.value)}px ${Math.round(l.offsetY.value)}px ${Math.round(l.blur.value)}px ${Math.round(l.spread.value)}px ${colorToHex(l.color)}`).join(', ');
    default: return v;
  }
}

/** Couleur DTCG → #rrggbb, ou rgba() s'il y a de la transparence. Gamut sRGB (e-mail, PowerPoint). */
export function colorToHex(v) {
  const c = new Color(v.colorSpace === 'srgb' ? 'srgb' : v.colorSpace, v.components, v.alpha ?? 1);
  const s = c.to('srgb').toGamut({ space: 'srgb', method: 'css' });
  const [r, g, b] = s.coords.map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255));
  const a = v.alpha ?? 1;
  if (a === 1) return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `rgba(${r}, ${g}, ${b}, ${num(a)})`;
}

export function rawMap(tokens) {
  const out = {};
  for (const [id, t] of Object.entries(tokens)) out[id] = toRaw(t);
  return out;
}

export function emitTs({ resolver, brand, fonts, typesImport = '../types' }) {
  const R = (input) => resolver.apply(brand ? { brand, ...input } : input);
  const maps = { light: R({}), dark: R({ mode: 'dark' }), surfaceDark: R({ surface: 'dark' }), surfaceDarker: R({ surface: 'darker' }), comfortable: R({ density: 'comfortable' }) };
  const ids = Object.keys(maps.light);
  const body = Object.entries(maps).map(([k, tokens]) => `export const ${k}: TokenValues = ${JSON.stringify(rawMap(tokens), null, 2)};\n`).join('\n');
  const types = Object.fromEntries(ids.map((id) => [id, maps.light[id].$type]));
  const out = [
    `// GÉNÉRÉ par scripts/build-tokens.mjs. Ne pas éditer.\n// Valeurs brutes de ${brand ? `la marque « ${brand} »` : 'la marque neutre'} : couleurs en #rrggbb (rgba() s'il y a de la transparence),\n// dimensions en px (rem × 16), durées en ms, courbes en [x1, y1, x2, y2].\n// Pour les e-mails, le PowerPoint, les graphiques : tout ce qui ne lit pas de variable CSS.\n`,
    `import type { TokenValues } from '${typesImport}';\n`,
    body,
    `/** Type DTCG de chaque jeton. */\nexport const types = ${JSON.stringify(types, null, 2)} as const;\n`,
  ];
  if (fonts) out.push(`/** Polices de la marque, avec les replis par support (voir docs/polices.md). */\nexport const fonts = ${JSON.stringify(fonts, null, 2)} as const;\n`);
  return { source: out.join('\n'), ids };
}

// ---------------------------------------------------------------- JSON DTCG résolu

/** Un arbre DTCG par marque et par mode, alias conservés (Figma, Penpot, Tokens Studio). */
export function emitDtcg(tokens) {
  const root = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json' };
  const ids = Object.keys(tokens).sort();
  const hasChildren = (id) => ids.some((o) => o.startsWith(id + '.'));
  for (const id of ids) {
    const t = tokens[id];
    let node = root;
    const parts = id.split('.');
    for (const p of parts) {
      node[p] ??= {};
      node = node[p];
    }
    const target = hasChildren(id) ? (node.$root = {}) : node;
    target.$type = t.$type;
    target.$value = structuredClone(t.originalValue?.$value ?? t.$value);
    if (t.$description) target.$description = t.$description;
    if (t.$extensions) target.$extensions = t.$extensions;
  }
  return root;
}

export function tokenSummary(tokens) {
  const byLayer = {};
  for (const id of Object.keys(tokens)) byLayer[layerOf(id)] = (byLayer[layerOf(id)] ?? 0) + 1;
  return byLayer;
}

export { CONTEXT_AXES };
