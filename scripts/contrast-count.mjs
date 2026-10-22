// Contrôle des contrastes WCAG 2.2 AA, sur clair, sombre complet et surfaces sombres, pour le
// thème neutre et pour chaque marque du dépôt. Même résolution que les sorties : les paires sont
// lues dans le résolveur des jetons, rien n'est copié à la main.
//
//   texte : 4,5:1 (critère 1.4.3) ; composant d'interface et repère graphique : 3:1 (critère 1.4.11).
//
// Usage : node scripts/contrast-count.mjs [--brands-dir chemin] [--verbose]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Color from 'colorjs.io';
import { listBrands } from './lib/build-all.mjs';
import { loadSystem } from './lib/tokens-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const brandsDir = args.includes('--brands-dir') ? path.resolve(args[args.indexOf('--brands-dir') + 1]) : path.join(root, 'brands');
const verbose = args.includes('--verbose');

const brands = listBrands(brandsDir);
const { resolver } = await loadSystem({
  tokensDir: path.join(root, 'tokens'),
  brands: Object.fromEntries(brands.map((b) => [b.id, path.join(b.dir, b.manifest.tokens ?? 'tokens.json')])),
});

const B = (n) => `component.base.${n}`;
const RC = (n) => `role.color.${n}`;

/** Paires prévues. kind : text (4,5) ou ui (3). Les composants d'interface sont lus dans la couche
 * `component.base`, qui suit la surface : c'est ce que voit l'utilisateur. */
function pairsFor(ctx, dataCount) {
  const P = [];
  const text = (fg, bg, use) => P.push({ fg, bg, use, kind: 'text' });
  const ui = (fg, bg, use) => P.push({ fg, bg, use, kind: 'ui' });
  text(B('foreground'), B('background'), 'texte courant sur le fond');
  text(B('card-foreground'), B('card'), 'texte sur une carte');
  text(B('muted-foreground'), B('background'), 'texte atténué sur le fond');
  text(B('muted-foreground'), B('card'), 'texte atténué sur une carte');
  text(B('heading'), B('background'), 'titre sur le fond');
  text(B('link'), B('background'), 'lien sur le fond');
  text(B('link'), B('card'), 'lien sur une carte');
  text(B('primary-foreground'), B('primary'), 'texte du bouton principal');
  text(B('primary-foreground'), B('primary-hover'), 'texte du bouton principal au survol');
  text(B('secondary-foreground'), B('secondary'), 'texte du bouton secondaire');
  text(B('accent-foreground'), B('accent'), 'texte survolé ou sélectionné');
  text(B('popover-foreground'), B('popover'), 'texte d\u2019un menu');
  ui(B('input'), B('background'), 'bordure de champ sur le fond');
  ui(B('input'), B('card'), 'bordure de champ sur une carte');
  ui(B('ring'), B('background'), 'anneau de focus sur le fond');
  ui(B('ring'), B('card'), 'anneau de focus sur une carte');
  ui(B('primary'), B('background'), 'bouton principal sur le fond');
  ui(RC('status.error'), B('card'), 'repère d\u2019erreur sur une carte');
  if (ctx.surface === 'light') {
    text(RC('text.tertiary'), RC('bg.page'), 'texte tertiaire sur le fond');
    text(RC('text.tertiary'), RC('bg.surface'), 'texte tertiaire sur une surface');
    text(RC('accent.ink'), RC('accent.subtle'), 'texte sur le fond d\u2019accent pâle');
    text(RC('action.text'), RC('action.base'), 'texte du bouton (rôle)');
    text(RC('sidebar.text-dim'), RC('sidebar.bg'), 'entrée de barre latérale au repos');
    text(RC('sidebar.text'), RC('sidebar.hover'), 'entrée de barre latérale survolée');
    text(RC('sidebar.text'), RC('sidebar.active'), 'entrée de barre latérale courante');
    ui(RC('border.strong'), RC('bg.page'), 'bordure forte sur le fond');
    ui(RC('border.strong'), RC('bg.surface'), 'bordure forte sur une surface');
    ui(RC('accent.base'), RC('bg.surface'), 'accent en touches');
    for (let i = 1; i <= 6; i++) ui(RC(`series.${i}`), RC('bg.surface'), `série ${i} d\u2019un graphique`);
    for (const s of ['success', 'warning', 'error', 'info']) {
      text(RC(`status.${s}.text`), RC(`status.${s}.bg`), `${s} : texte sur son fond`);
      text(RC(`status.${s}.text`), RC('bg.surface'), `${s} : texte sur une surface`);
      ui(RC(`status.${s}`), RC('bg.surface'), `${s} : repère`);
    }
    for (let i = 1; i <= dataCount; i++) {
      text(RC(`data.${i}.text`), RC(`data.${i}.bg`), `palier ${i} : texte sur son fond`);
      text(RC(`data.${i}.text`), RC('bg.surface'), `palier ${i} : texte sur une surface`);
      ui(RC(`data.${i}.mark`), RC('bg.surface'), `palier ${i} : repère graphique`);
    }
  }
  return P;
}

const CONTEXTS = [
  { name: 'clair', input: {}, surface: 'light' },
  { name: 'sombre complet', input: { mode: 'dark' }, surface: 'light' },
  { name: 'surface sombre', input: { surface: 'dark' }, surface: 'dark' },
  { name: 'surface la plus sombre', input: { surface: 'darker' }, surface: 'darker' },
];
// Les paliers de données et les statuts se lisent aussi en sombre complet.
const DARK_EXTRA = (ctx, count) => (ctx.name === 'sombre complet' ? { ...ctx, surface: 'light' } : ctx);

const wcag = (a, b) => Color.contrast(new Color('srgb', a), new Color('srgb', b), 'WCAG21');
function rgbOf(token) {
  const v = token.$value;
  const c = new Color(v.colorSpace === 'srgb' ? 'srgb' : v.colorSpace, v.components, 1);
  return c.to('srgb').toGamut({ space: 'srgb', method: 'css' }).coords;
}

let total = 0;
const failing = [];
const summary = [];
for (const brand of ['neutral', ...brands.map((b) => b.id)]) {
  for (const ctx of CONTEXTS) {
    const tokens = resolver.apply({ brand, ...ctx.input });
    const count = tokens['role.data.count'].$value;
    let ok = 0;
    let n = 0;
    for (const p of pairsFor(DARK_EXTRA(ctx, count), count)) {
      const fg = tokens[p.fg];
      const bg = tokens[p.bg];
      if (!fg || !bg) {
        failing.push({ brand, ctx: ctx.name, ...p, ratio: NaN, why: 'jeton introuvable' });
        n++;
        continue;
      }
      const ratio = wcag(rgbOf(fg), rgbOf(bg));
      const need = p.kind === 'text' ? 4.5 : 3;
      n++;
      if (ratio + 1e-9 >= need) ok++;
      else failing.push({ brand, ctx: ctx.name, ...p, ratio, need });
      if (verbose) console.log(`${brand} · ${ctx.name} · ${p.use}: ${ratio.toFixed(2)}:1 (seuil ${need})`);
    }
    total += n;
    summary.push(`${brand.padEnd(8)} ${ctx.name.padEnd(24)} ${String(ok).padStart(3)} conformes sur ${String(n).padStart(3)}`);
  }
}
console.log(summary.join('\n'));
console.log(`\n${total} paires mesurées (WCAG 2.2 AA : texte 4,5:1, composant et repère 3:1), ${failing.length} sous le seuil.`);
for (const f of failing) console.log(`  sous le seuil : ${f.brand} · ${f.ctx} · ${f.use} (${f.fg} sur ${f.bg}) : ${Number.isNaN(f.ratio) ? f.why : `${f.ratio.toFixed(2)}:1, seuil ${f.need}:1`}`);
process.exit(failing.length ? 1 : 0);
