// Rend chaque story du Storybook construit dans un navigateur headless (Playwright) et échoue si
// une story lève une erreur, écrit dans la console en erreur, appelle un hôte distant, déborde en
// largeur ou reste vide. Sert storybook-static par un petit serveur statique lancé dans ce
// processus et arrêté à la fin : aucun serveur à lancer à la main.
//
// Chaque story est rendue pour : neutre et démonstration, clair et sombre complet (4 combinaisons),
// à 1440 px. Les pages de documentation sont aussi rendues à 390 px.
//
// Usage : node scripts/verify-stories.mjs [--quick] [--out dossier-de-captures]
//   --quick : une seule combinaison (neutre, clair) par story ; sert aux essais.
//   --out   : écrit une capture par story dans ce dossier.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'storybook-static');
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const outDir = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : null;
if (!fs.existsSync(dir)) {
  console.error('storybook-static/ est absent : lancer `npm run build-storybook`.');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon', '.map': 'application/json' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  let file = path.join(dir, decodeURIComponent(url.pathname));
  if (!file.startsWith(dir)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}) });

const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
console.log(`${stories.length} stories dans l'index.`);

const combos = quick ? [{ brand: 'neutral', theme: 'light' }] : [
  { brand: 'neutral', theme: 'light' },
  { brand: 'neutral', theme: 'dark' },
  { brand: 'demo', theme: 'light' },
  { brand: 'demo', theme: 'dark' },
];
const failures = [];
let rendered = 0;
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`erreur de page : ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console.error : ${m.text()}`);
});
page.on('request', (r) => {
  const u = r.url();
  if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:')) problems.push(`requête distante : ${u}`);
});

async function render(story, combo, width) {
  problems.length = 0;
  await page.setViewportSize({ width, height: 900 });
  const globals = `brand:${combo.brand};theme:${combo.theme}`;
  await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story&globals=${encodeURIComponent(globals)}`, { waitUntil: 'load' });
  await page.waitForSelector('#storybook-root > *', { timeout: 20000 }).catch(() => problems.push('rien rendu dans #storybook-root'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const m = await page.evaluate(() => ({
    brand: document.documentElement.dataset.brand,
    theme: document.documentElement.dataset.theme ?? 'light',
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    text: (document.querySelector('#storybook-root')?.textContent ?? '').trim().length,
    errorShown: !!document.querySelector('.sb-errordisplay:not([hidden])') && getComputedStyle(document.querySelector('.sb-errordisplay')).display !== 'none',
  }));
  const where = `${story.id} [${combo.brand}/${combo.theme}/${width}px]`;
  if (m.errorShown) problems.push('Storybook affiche une erreur');
  if (m.text === 0) problems.push('story vide');
  if (m.brand !== combo.brand) problems.push(`marque appliquée « ${m.brand} », attendue « ${combo.brand} »`);
  if (m.theme !== combo.theme) problems.push(`thème appliqué « ${m.theme} », attendu « ${combo.theme} »`);
  if (m.overflow > 1) problems.push(`débordement horizontal de ${m.overflow} px`);
  if (problems.length) failures.push(`${where} : ${[...new Set(problems)].join(' ; ')}`);
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    await page.screenshot({ path: path.join(outDir, `${story.id}--${combo.brand}-${combo.theme}-${width}.png`), fullPage: true });
  }
  rendered++;
}

for (const story of stories) {
  for (const combo of combos) {
    await render(story, combo, 1440);
    if (!quick && combo.theme === 'light') await render(story, combo, 390);
  }
}
await browser.close();
server.close();

console.log(`${rendered} rendus (${stories.length} stories × marques et thèmes, 1440 px et 390 px).`);
if (failures.length) {
  console.error(`${failures.length} échec(s) :\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('Toutes les stories se rendent sans erreur, sans appel distant et sans débordement.');
