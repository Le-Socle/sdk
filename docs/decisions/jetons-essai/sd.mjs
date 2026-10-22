import StyleDictionary from 'style-dictionary';
const sd = new StyleDictionary({
  source: ['./sample.tokens.json'],
  usesDtcg: true,
  platforms: {
    css: { transformGroup: 'css', buildPath: 'out-sd/', files: [{ destination: 'tokens.css', format: 'css/variables' }] },
    js: { transformGroup: 'js', buildPath: 'out-sd/', files: [{ destination: 'tokens.js', format: 'javascript/es6' }, { destination: 'tokens.json', format: 'json/nested' }] },
  },
});
await sd.buildAllPlatforms();
