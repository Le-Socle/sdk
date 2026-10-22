// Notes de version d'une étiquette : les commits depuis l'étiquette précédente, groupés par lot.
// Usage : node scripts/release-notes.mjs v0.1.0
import { execFileSync } from 'node:child_process';

const tag = process.argv[2];
if (!tag) {
  console.error('Usage : node scripts/release-notes.mjs <étiquette>');
  process.exit(2);
}
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
let previous = '';
try {
  previous = git('describe', '--tags', '--abbrev=0', '--match', 'v*', `${tag}^`);
} catch {
  previous = '';
}
const range = previous ? `${previous}..${tag}` : tag;
const subjects = git('log', '--no-merges', '--pretty=format:%s', range).split('\n').filter(Boolean);
const groups = new Map();
for (const s of subjects) {
  const m = /^(Lot \d+)\s*·\s*([^:]+):\s*(.*)$/.exec(s);
  const key = m ? `${m[1]} · ${m[2]}` : 'Autres changements';
  groups.set(key, [...(groups.get(key) ?? []), m ? m[3] : s]);
}
const out = [`# SDK du Socle ${tag}`, ''];
out.push(`Installation : \`npm install github:Le-Socle/sdk#${tag}\``, '');
out.push(previous ? `Changements depuis ${previous} :` : 'Première version.', '');
for (const [k, items] of groups) {
  out.push(`## ${k}`, '', ...items.map((i) => `- ${i}`), '');
}
console.log(out.join('\n'));
