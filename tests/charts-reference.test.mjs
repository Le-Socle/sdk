// Repère de référence, cible et domaine : Arc, ProgressBar, LineChart, HeatMatrix (issue #45).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadTs } from './lib/load-ts.mjs';

const m = await loadTs('tests/lib/render-entry.tsx', { bundleAll: true });
const h = m.React.createElement;

test('ProgressBar : repère et cible placés à leur position, lus dans la description', () => {
  const out = m.html(h(m.ProgressBar, { value: 40, max: 200, reference: 50, target: 150 }));
  assert.match(out, /data-mark="reference"[^>]*left:25%/);
  assert.match(out, /data-mark="target"[^>]*left:75%/);
  assert.match(out, /Référence 50, Cible 150/);
});

test('ProgressBar : sans repère ni cible, rien de plus (non-régression)', () => {
  const out = m.html(h(m.ProgressBar, { value: 40 }));
  assert.doesNotMatch(out, /data-mark/);
  assert.doesNotMatch(out, /Référence|Cible/);
});

test('Arc : repère et cible tracés, lus dans la description', () => {
  const out = m.html(h(m.Arc, { label: 'Maturité', value: 60, reference: 50, target: 80 }));
  assert.match(out, /<line data-mark="reference"/);
  assert.match(out, /<line data-mark="target"/);
  assert.match(out, /Référence 50, Cible 80/);
  assert.doesNotMatch(m.html(h(m.Arc, { label: 'Maturité', value: 60 })), /data-mark/);
});

test('LineChart : références acceptées (propriétés exposées)', () => {
  const out = m.html(h(m.LineChart, { data: [{ a: 'x', v: 1 }], categoryKey: 'a', series: [{ key: 'v', label: 'V' }], summary: 's', reference: 5, target: 9 }));
  assert.ok(out.length > 0);
});

test('HeatMatrix : un domaine (min, max) place les cellules sur l’échelle', () => {
  // Domaine 0-5, valeur 4,5 = 90 % → tout en haut ; sans domaine, 4,5 sur 100 = 4,5 % → palier 1 sans higherIsBetter.
  const props = { caption: 'c', columns: ['A'], rows: [{ label: 'L', values: [4.5] }] };
  const scale = { count: 4, thresholds: [25, 50, 75] };
  const sans = m.html(h(m.HeatMatrix, { ...props, scale }));
  const avec = m.html(h(m.HeatMatrix, { ...props, scale, domain: [0, 5] }));
  assert.match(sans, /data-tier="1"/);
  assert.match(avec, /data-tier="4"/);
});
