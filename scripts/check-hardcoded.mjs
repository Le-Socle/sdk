// Cherche les valeurs écrites en dur (couleur, taille, durée, courbe) hors des fichiers de jetons.
//
// Lit les fichiers suivis par git (et les nouveaux non ignorés) : .ts, .tsx, .js, .jsx, .mdx, .css, .html
// sous src/, stories/, .storybook/. Sont exclus, parce qu'ils SONT les jetons ou en sont issus :
// tokens/, brands/, fonts/, generated/, src/tokens/generated/.
//
// Règles :
//   - couleur hexadécimale, rgb(), hsl(), oklch(), oklab(), color-mix() avec littéral ;
//   - dans le CSS : toute longueur en px, rem ou em (sauf 0, 1px et 2px de filet via variables) et toute
//     durée en ms ou s, toute cubic-bezier( ;
//   - dans les classes Tailwind à valeur libre ([...px]) et les styles en ligne ;
//   - noms de couleur CSS (red, white…) dans un attribut `color`, `fill`, `stroke`, `background`.
// Une ligne peut s'exempter avec le commentaire `hardcoded-ok: raison` (à justifier dans la revue).
//
// Usage : node scripts/check-hardcoded.mjs [--root dossier]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const root = args.includes('--root') ? path.resolve(args[args.indexOf('--root') + 1]) : here;

const INCLUDE_DIRS = ['src', 'stories', '.storybook'];
const EXCLUDE = [/^src\/tokens\/generated\//, /^src\/styles\/generated\//];
const EXT = /\.(tsx?|jsx?|mjs|mdx|css|html)$/;

let files;
try {
  files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      const rel = path.join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else files.push(rel);
    }
  };
  for (const d of INCLUDE_DIRS) if (fs.existsSync(path.join(root, d))) walk(d);
}
files = files.filter((f) => INCLUDE_DIRS.some((d) => f.startsWith(d + '/')) && EXT.test(f) && !EXCLUDE.some((r) => r.test(f)) && fs.existsSync(path.join(root, f)));

const COMMON = [
  ['couleur hexadécimale', /(?<![\w&/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/],
  ['couleur fonctionnelle', /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/],
  ['taille en classe libre', /-\[[^\]\s]*\d(?:px|rem|em|vh|vw|dvh|svh)\b[^\]]*\]/],
  ['durée ou courbe en classe libre', /\b(?:duration|delay|ease)-\[/],
  ['valeur en px, rem ou ms dans un style en ligne', /style=\{\{[^}]*\d(?:px|rem|em|ms)\b/],
  ['nom de couleur CSS', /\b(?:color|fill|stroke|background(?:-color)?)\s*[:=]\s*["']?(?:red|blue|green|black|white|gray|grey|orange|yellow|purple|pink)\b/i],
];
const CSS_ONLY = [
  ['longueur littérale en CSS', /(?<![\w.-])(?:[2-9]|[1-9]\d+|\d*\.\d+)(?:px|rem|em)\b/],
  ['durée littérale en CSS', /(?<![\w.-])\d*\.?\d+m?s\b(?!\w)/],
  ['courbe littérale en CSS', /\bcubic-bezier\(/],
];

const hits = [];
for (const f of files) {
  const css = f.endsWith('.css');
  let inBlock = false;
  fs.readFileSync(path.join(root, f), 'utf8').split('\n').forEach((raw, i) => {
    // commentaires : bloc /* … */ sur une ou plusieurs lignes, puis //
    let line = raw;
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end === -1) return;
      line = line.slice(end + 2);
      inBlock = false;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    const open = line.indexOf('/*');
    if (open !== -1) {
      line = line.slice(0, open);
      inBlock = true;
    }
    if (!css) line = line.replace(/(^|\s)\/\/.*$/, '$1');
    if (/hardcoded-ok:/.test(raw)) return;
    const rules = css ? [...COMMON, ...CSS_ONLY] : COMMON;
    for (const [label, re] of rules) {
      const m = re.exec(line);
      if (m) hits.push({ fichier: f, ligne: i + 1, règle: label, extrait: m[0] });
    }
  });
}

console.log(`${files.length} fichiers lus (${INCLUDE_DIRS.join(', ')} ; hors jetons générés).`);
console.log(`Valeurs en dur : ${hits.length}.`);
if (hits.length) {
  console.table(hits.slice(0, 60));
  process.exit(1);
}
