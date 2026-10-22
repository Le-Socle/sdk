import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

// Storybook 10 en React. Les feuilles de jetons viennent de generated/ (rempli par `npm run tokens`,
// que `npm run build-storybook` lance avant). Tailwind 4 sert dès que les composants arrivent (lot 2).
const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    }),
};

export default config;
