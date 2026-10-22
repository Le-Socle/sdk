// Table de correspondance ancien nom → nouveau nom (docs/correspondance-jetons.json, source ;
// docs/correspondance-jetons.md, vue générée).
//
// Contrôles :
//   1. chaque ligne a un nouveau nom qui existe dans generated/css/tokens.css, ou le statut « hors SDK » ;
//   2. aucun ancien nom en double ;
//   3. le Markdown est à jour (sinon : `node scripts/check-mapping.mjs --write`).
// Usage : node scripts/check-mapping.mjs [--write]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = JSON.parse(fs.readFileSync(path.join(root, 'docs/correspondance-jetons.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'generated/css/tokens.css'), 'utf8');
const declared = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]));

const errors = [];
const seen = new Set();
for (const r of doc.rows) {
  if (seen.has(r.ancien)) errors.push(`ancien nom en double : ${r.ancien}`);
  seen.add(r.ancien);
  if (r.statut === 'hors SDK') {
    if (r.nouveau) errors.push(`${r.ancien} : « hors SDK » ne doit pas avoir de nouveau nom`);
    continue;
  }
  if (!r.nouveau || !declared.has(r.nouveau)) errors.push(`${r.ancien} → ${r.nouveau} : ce nouveau nom n'existe pas dans tokens.css`);
}

const count = (s) => doc.rows.filter((r) => r.statut === s).length;
const lines = [];
lines.push('# Correspondance des jetons : ancien nom → nouveau nom');
lines.push('');
lines.push(`Source : ${doc.source}. Fichier généré depuis \`docs/correspondance-jetons.json\` par \`node scripts/check-mapping.mjs --write\`.`);
lines.push('');
lines.push(`La marque APOLEOS s'en sert pour réécrire ses jetons dans son propre paquet. ${doc.rows.length} variables d'origine : ${count('identique')} identiques, ${count('renommé')} renommées, ${count('fusionné')} fusionnées dans l'échelle de données, ${count('hors SDK')} laissées hors du SDK${count('équivalent') ? `, ${count('équivalent')} équivalentes (même rendu, mais une valeur calculée une fois à la place d'un \`color-mix()\`)` : ''}.`);
lines.push('');
lines.push('## Risque et nombre de paliers');
lines.push('');
lines.push('L\'ancienne échelle de risque a quatre niveaux (faible, moyen, élevé, critique) ; le SDK a une échelle de données à 4 ou 6 paliers, fixée par la marque. Palier 1 = le plus favorable.');
lines.push('');
lines.push('| Ancien niveau de risque | Marque à 4 paliers | Marque à 6 paliers (exemple : 2, 3, 4, 6) |');
lines.push('|---|---|---|');
lines.push('| faible (`risk-low`) | palier 1 | palier 2 (le palier 1 est un « excellent » neuf) |');
lines.push('| moyen (`risk-medium`) | palier 2 | palier 3 |');
lines.push('| élevé (`risk-high`) | palier 3 | palier 4 |');
lines.push('| critique (`risk-critical`) | palier 4 | palier 6 (le palier 5 est un « très fragile » neuf) |');
lines.push('');
lines.push('Les tableaux ci-dessous donnent l\'affectation d\'une marque à **4 paliers**. Une marque à 6 paliers choisit elle-même quels paliers reprennent les quatre couleurs d\'état d\'origine ; les paliers 5 et 6 n\'ont pas d\'ancien nom (ce sont des jetons nouveaux : `--color-data-5-*`, `--color-data-6-*`). Les libellés des paliers viennent de `brand.json` (`tierLabels`).');
lines.push('');
lines.push('Règles de nommage : une couche par préfixe. Valeurs : `--palette-*`, `--font-*`, `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*`, `--space-*`, `--ease-*`, `--duration-*`. Rôles : `--color-*`, `--type-*`, `--radius-*`, `--shadow-*`, `--control-*`, `--row-*`, `--layer-*`, `--container-*`, `--breakpoint-*`, `--data-*`. Composants : `--background`, `--primary`… (vocabulaire shadcn/ui) et `--<composant>-<partie>` (`--button-primary-bg`…). Aucune teinte de marque dans un nom : le bleu de Prusse devient `primary`, le Black Cherry `accent`, le Noyer `secondary`, le gris bleuté `neutral`.');
lines.push('');
lines.push('| Ancien nom | Nouveau nom | Statut | Note |');
lines.push('|---|---|---|---|');
for (const r of doc.rows) lines.push(`| \`${r.ancien}\` | ${r.nouveau ? `\`${r.nouveau}\`` : '—'} | ${r.statut} | ${r.note || ''} |`);
lines.push('');
lines.push('## Jetons nouveaux (sans équivalent dans tokens.css d\'origine)');
lines.push('');
lines.push('- Échelle de données : `--data-count`, `--data-threshold-1…5` (nombre de paliers et seuils, fixés par la marque).');
lines.push('- Rôles : `--color-text-link`, `--color-border-inverse`, `--color-bg-inverse-raised`, `--color-series-1…6` (séries de graphique), `--color-data-5…6-*` (paliers 5 et 6 de l\'échelle).');
lines.push('- Polices : `--font-figure` (chiffres, tabulaires), `--font-code`.');
lines.push('- Points de rupture : `--breakpoint-sm|md|lg|xl` (étaient des littéraux de `theme.css`).');
lines.push('- Couche des composants : tout le vocabulaire shadcn/ui (`--background`, `--primary`…, ancien `bridge.css`) et les jetons `--button-*`, `--input-*`, `--card-*`, `--badge-*`.');
lines.push('- Rôles typographiques : `--type-<rôle>-weight|size|leading|family` (quatre jetons par rôle), l\'abrégé `--type-<rôle>` en est dérivé.');
lines.push('');
lines.push('## Ce qui n\'entre pas');
lines.push('');
lines.push('Les dimensions propres à une page de la landing APOLEOS (une trentaine de `--size-*`) et les rayons de la politique de formes B (`--radius-frame-round`, `--radius-screen-round`) restent dans le dépôt qui s\'en sert. Le mot « Prusse », « Black Cherry », « Noyer » et les hex de la charte vivent dans le paquet de la marque.');
const md = lines.join('\n') + '\n';
const mdFile = path.join(root, 'docs/correspondance-jetons.md');

if (process.argv.includes('--write')) {
  fs.writeFileSync(mdFile, md);
  console.log(`écrit ${path.relative(root, mdFile)}`);
} else if (!fs.existsSync(mdFile) || fs.readFileSync(mdFile, 'utf8') !== md) {
  errors.push('docs/correspondance-jetons.md n\'est pas à jour : lancer `node scripts/check-mapping.mjs --write`.');
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`correspondance : ${doc.rows.length} variables d'origine, toutes traitées ; ${doc.rows.filter((r) => r.nouveau).length} nouveaux noms vérifiés dans tokens.css.`);
