
import { parse, build, defineConfig } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import js from '@terrazzo/plugin-js';
import fs from 'node:fs';
const config = defineConfig({
  outDir: new URL('./out-tz2/', import.meta.url),
  plugins: [
    css({ filename: 'tokens.css', permutations: [
      { input: { theme: 'light', brand: 'neutral' }, prepare: (c) => `:root {\n${c}\n}` },
      { input: { theme: 'dark', brand: 'neutral' }, prepare: (c) => `[data-theme="dark"] {\n${c}\n}` },
      { input: { theme: 'light', brand: 'demo' }, prepare: (c) => `[data-brand="demo"] {\n${c}\n}` },
    ]}),
    js({ filename: 'tokens.js' }),
  ],
}, { cwd: new URL('./', import.meta.url) });
const src = new URL('./system.resolver.json', import.meta.url);
const r = await parse([{ filename: src, src: fs.readFileSync(src, 'utf8') }], { config });
console.log('tokens', Object.keys(r.tokens).length, 'resolver?', !!r.resolver);
const b = await build(r.tokens, { sources: r.sources, resolver: r.resolver, config });
fs.mkdirSync('out-tz2', {recursive:true});
for (const f of b.outputFiles) { fs.writeFileSync('out-tz2/'+f.filename, f.contents); console.log('wrote', f.filename); }
