// Charge un module TypeScript du SDK pour les tests Node : esbuild le compile en un fichier ESM
// (imports sans extension résolus), écrit dans le dossier temporaire du processus.
import { build } from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

export async function loadTs(relative, { bundleAll = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-ts-'));
  const outfile = path.join(dir, 'module.mjs');
  await build({
    entryPoints: [path.join(root, relative)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    // `bundleAll` : tout embarqué (React compris), pour rendre un composant en HTML depuis un test.
    ...(bundleAll ? { banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" } } : {}),
    external: bundleAll ? [] : ['react', 'react-dom', 'lucide-react', 'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge', 'cmdk', 'sonner', 'recharts'],
  });
  return import(pathToFileURL(outfile).href);
}
