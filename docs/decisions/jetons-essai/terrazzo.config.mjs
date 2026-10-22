import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '@terrazzo/plugin-tailwind';
import js from '@terrazzo/plugin-js';

export default defineConfig({
  tokens: ['./sample.tokens.json'],
  outDir: './out-terrazzo/',
  plugins: [
    css({ filename: 'tokens.css', modeSelectors: [{ mode: 'dark', selectors: ['[data-theme="dark"]'] }] }),
    tailwind({ filename: 'theme.css', template: '../theme.template.css', theme: { color: { '*': ['color.*'] }, spacing: { '*': ['space.*'] } } }),
    js({ filename: 'tokens.js', json: true }),
  ],
});
