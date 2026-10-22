// Recherche automatique de noms de marque interdits dans tout le dépôt suivi par git.
// La marque vit dans son propre paquet : le SDK n'en contient ni le nom, ni les noms de teinte,
// ni les valeurs de la charte.
//
// Fichiers autorisés à les citer (liste fermée, ci-dessous) : le tableau de correspondance, qui
// doit nommer les anciennes variables, les documents de pilotage, et ce script.
//
// Usage : node scripts/check-brands.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Mots interdits (insensibles à la casse). */
const WORDS = ['apoleos', 'prusse', 'cherry', 'walnut', 'noyer', 'stack sans', 'stacksans', 'relume'];
/** Valeurs de la charte APOLEOS (hex, sans la casse). */
const HEX = ['244E7C', '002C58', '001D3D', '001028', '640D14', '582F0E', 'F8DDDB', 'F5F7F9', 'ECF1F6', 'E6EBF1', 'D7DEE6', '66717F', '5F7186', '444E5B', '458554', '2E623B', 'CE9042', '8A5A14', 'CF630D', 'AB4B16', 'BD0000', 'DEF1E1', 'F8E9D2', 'FBE2D2', 'F8D7D7'];

const ALLOWED = new Set([
  'docs/correspondance-jetons.md',
  'docs/correspondance-jetons.json',
  'docs/PLAN.md',
  'docs/REGLES-AGENTS-NUIT.md',
  'docs/decisions/jetons-outil.md',
  'scripts/check-brands.mjs',
  'scripts/check-mapping.mjs',
  'tests/checks.test.mjs',
]);
const SKIP_EXT = /\.(woff2?|png|jpe?g|webp|ico|pdf|lock)$/i;
const SKIP_PATH = /(^|\/)(package-lock\.json|OFL\.txt)$/;

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !ALLOWED.has(f) && !SKIP_EXT.test(f) && !SKIP_PATH.test(f) && fs.existsSync(path.join(root, f)));

const re = new RegExp(`\\b(${WORDS.map((w) => w.replace(/ /g, '\\s+')).join('|')})`, 'i');
const hexRe = new RegExp(`#?\\b(${HEX.join('|')})\\b`, 'i');
const hits = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), 'utf8');
  text.split('\n').forEach((line, i) => {
    const m = re.exec(line) ?? hexRe.exec(line);
    if (m) hits.push(`${f}:${i + 1}: « ${m[0]} » dans ${line.trim().slice(0, 100)}`);
  });
}
// Les noms de fichiers aussi.
for (const f of files) if (re.test(f)) hits.push(`${f}: le nom du fichier contient un nom de marque`);

console.log(`${files.length} fichiers lus (${ALLOWED.size} autorisés à citer l'ancienne charte, exclus).`);
if (hits.length) {
  console.error(`${hits.length} nom(s) de marque trouvé(s) :\n` + hits.slice(0, 40).join('\n'));
  process.exit(1);
}
console.log('Aucun nom de marque, aucun nom de teinte de marque, aucune valeur de la charte APOLEOS dans le SDK.');
