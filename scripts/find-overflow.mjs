// Diagnostic : liste les éléments d'une story qui dépassent la largeur de la fenêtre.
// Usage : node scripts/find-overflow.mjs <id-de-story> [largeur=390]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'storybook-static');
const [id, width = '390'] = process.argv.slice(2);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  let file = path.join(dir, decodeURIComponent(url.pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}) });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'load' });
await page.waitForSelector('#storybook-root > *');
await page.waitForTimeout(500);
const out = await page.evaluate((w) => {
  const hits = [];
  for (const el of document.querySelectorAll('#storybook-root *')) {
    const r = el.getBoundingClientRect();
    if (r.right > w + 1 && r.width > 0) hits.push(`${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).slice(0, 90)} droite=${Math.round(r.right)} largeur=${Math.round(r.width)}`);
  }
  return { scrollWidth: document.documentElement.scrollWidth, hits: hits.slice(0, 12) };
}, Number(width));
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
