import StyleDictionary from 'style-dictionary';
import { formats } from 'style-dictionary/enums';

const contexts = [
  { name: 'base', selector: ':root', files: ['values.tokens.json', 'roles.tokens.json'], only: null },
  { name: 'dark', selector: '[data-theme="dark"]', files: ['values.tokens.json', 'roles.tokens.json', 'dark.tokens.json'], only: 'dark.tokens.json' },
  { name: 'demo', selector: '[data-brand="demo"]', files: ['values.tokens.json', 'roles.tokens.json', 'brand.tokens.json'], only: 'brand.tokens.json' },
];
for (const c of contexts) {
  const sd = new StyleDictionary({
    source: c.files,
    usesDtcg: true,
    log: { verbosity: 'verbose' },
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'out-sd2/',
        files: [{
          destination: `${c.name}.css`,
          format: formats.cssVariables,
          options: { selector: c.selector, outputReferences: true },
          filter: c.only ? (t) => t.filePath.endsWith(c.only) : undefined,
        }],
      },
    },
  });
  await sd.buildAllPlatforms();
}
