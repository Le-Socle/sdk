// Capture des stories choisies, pour les regarder (preuve visuelle). Sert storybook-static par un
// petit serveur lancé dans ce processus et arrêté à la fin.
//
// Usage : node scripts/capture-stories.mjs --out dossier [--ids a,b] [--match texte] [--brands neutral,demo]
//         [--themes light,dark] [--widths 1440,390] [--clip selecteur] [--click selecteur]
//   --ids    identifiants exacts de stories (sinon --match : sous-chaîne de l'identifiant)
//   --clip   ne capture que cet élément (zoom sur les contrôles)
//   --click  clique cet élément avant la capture (ouvrir un menu), puis attend 400 ms
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'storybook-static');
const args = process.argv.slice(2);
const arg = (name, dflt) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : dflt);
const out = path.resolve(arg('out', 'captures'));
const ids = arg('ids', '')?.split(',').filter(Boolean);
const match = arg('match', '');
const brands = arg('brands', 'neutral,demo').split(',');
const themes = arg('themes', 'light,dark').split(',');
const widths = arg('widths', '1440').split(',').map(Number);
const clip = arg('clip', '');
const click = arg('click', '');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  let file = path.join(dir, decodeURIComponent(url.pathname));
  if (!file.startsWith(dir)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end('not found');
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (ids.length ? ids.includes(e.id) : e.id.includes(match)));
fs.mkdirSync(out, { recursive: true });
const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
for (const s of stories) {
  for (const brand of brands) {
    for (const theme of themes) {
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story&globals=${encodeURIComponent(`brand:${brand};theme:${theme}`)}`, { waitUntil: 'load' });
        await page.waitForSelector('#storybook-root > *', { timeout: 20000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        if (click) {
          await page.locator(click).first().click();
          await page.waitForTimeout(400);
        }
        const file = path.join(out, `${s.id}--${brand}-${theme}-${w}${click ? '-ouvert' : ''}.png`);
        if (clip) await page.locator(clip).first().screenshot({ path: file });
        else await page.screenshot({ path: file, fullPage: true });
        console.log(file);
      }
    }
  }
}
await browser.close();
server.close();
