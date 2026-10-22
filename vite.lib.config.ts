import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Build de la bibliothèque : `npm run build:lib` produit dist/ (ESM). Storybook a sa propre
// configuration (.storybook/main.ts) et ne lit pas ce fichier.
// - Un point d'entrée par étage et par support (tokens, ui, app, site, slides, document, email,
//   social, render) plus la racine : l'application n'embarque que ce qu'elle importe.
// - Un fichier de sortie par module source (preserveModules) : la directive "use client" reste en
//   tête des seuls modules qui la portent.
// - Rien n'est minifié : les chaînes de classes restent lisibles dans dist/, c'est là que le
//   Tailwind de l'application les lit.
// - Les dépendances d'exécution et les pairs restent externes.
// Les types sont émis ensuite par tsc (tsconfig.build.json), puis tsc-alias.

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const supports = ['tokens', 'ui', 'app', 'site', 'slides', 'document', 'email', 'social', 'render'];

export default defineConfig({
  resolve: { alias: { '@': here('./src') } },
  publicDir: false,
  build: {
    lib: {
      entry: {
        index: here('./src/index.ts'),
        ...Object.fromEntries(supports.map((s) => [`${s}/index`, here(`./src/${s}/index.ts`)])),
        'brands/demo/index': here('./src/brands/demo/index.ts'),
        'app/demo/index': here('./src/app/demo/index.ts'),
      },
      formats: ['es'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rolldownOptions: {
      external: (id: string) => external.some((name) => id === name || id.startsWith(`${name}/`)),
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
      onwarn(warning: { code?: string }, warn: (w: unknown) => void) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
});
