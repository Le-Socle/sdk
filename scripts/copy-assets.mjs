// Après le build de la bibliothèque : copie dans dist/ ce que les points d'entrée CSS et JSON
// publient (feuilles générées, polices, JSON DTCG). Lit generated/ (rempli par `npm run tokens`).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gen = path.join(root, 'generated');
const dist = path.join(root, 'dist');
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};
copy(path.join(gen, 'css'), path.join(dist, 'css'));
copy(path.join(gen, 'fonts'), path.join(dist, 'fonts'));
copy(path.join(root, 'src/styles/base.css'), path.join(dist, 'css/base.css'));
copy(path.join(gen, 'brands'), path.join(dist, 'brands'));
// Le Tailwind de l'application lit les classes des composants compilés dans dist/ : l'adresse
// se lit depuis ce fichier, où que le paquet soit installé.
const themeFile = path.join(dist, 'css/theme.css');
fs.writeFileSync(themeFile, fs.readFileSync(themeFile, 'utf8') + '\n/* Les composants compilés du SDK : leurs classes y sont écrites en clair. */\n@source "../";\n');
for (const f of fs.readdirSync(path.join(gen, 'dtcg'))) copy(path.join(gen, 'dtcg', f), path.join(dist, 'tokens/dtcg', f));
copy(path.join(gen, 'dtcg/neutral.light.json'), path.join(dist, 'tokens/tokens.dtcg.json'));
console.log('dist/ : feuilles CSS, polices, JSON DTCG copiés.');
