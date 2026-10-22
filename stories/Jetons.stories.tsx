import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Page, Section, Swatch, Table, rawValue, show } from './lib/ui';
import { tokens, withPrefix } from './lib/tokens-data';

const meta: Meta = { title: 'Jetons', parameters: { layout: 'fullscreen' } };
export default meta;

const groupBy = <T,>(rows: T[], key: (r: T) => string): Map<string, T[]> => {
  const m = new Map<string, T[]>();
  for (const r of rows) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return m;
};

export const Palettes: StoryObj = {
  render: () => {
    const groups = groupBy(withPrefix('value.palette.').filter((t) => t.type === 'color' && !t.id.includes('.tier.')), (t) => t.id.split('.')[2] ?? '');
    return (
      <Page title="Palettes">
        <p>Couche 1 : les valeurs. Une marque remplace ces gammes ; aucun composant ne les lit directement.</p>
        {[...groups.entries()].map(([name, rows]) => (
          <Section key={name} title={name}>
            <div className="doc__steps">
              {rows.map((t) => (
                <Swatch key={t.id} cssVar={t.css} label={t.id.split('.').slice(3).join('.') || name} value={show(rawValue(t.id))} />
              ))}
            </div>
          </Section>
        ))}
      </Page>
    );
  },
};

export const RolesDeCouleur: StoryObj = {
  name: 'Rôles de couleur',
  render: () => {
    const groups = groupBy(withPrefix('role.color.').filter((t) => !t.id.startsWith('role.color.data.')), (t) => t.id.split('.')[2] ?? '');
    return (
      <Page title="Rôles de couleur">
        <p>Couche 2 : ce que les composants lisent. Un rôle pointe vers une valeur ; le thème sombre et les surfaces sombres remappent les rôles.</p>
        {[...groups.entries()].map(([name, rows]) => (
          <Section key={name} title={name}>
            <Table
              head={['', 'Variable', 'Lit', 'Valeur', 'Usage']}
              rows={rows.map((t) => [
                <div key="s" style={{ width: 'var(--space-12)' }}><Swatch cssVar={t.css} label="" /></div>,
                <code key="c">{t.css}</code>,
                t.alias ? <code key="a">{t.alias}</code> : '',
                show(rawValue(t.id)),
                t.description,
              ])}
            />
          </Section>
        ))}
      </Page>
    );
  },
};

const stepStyle = (i: number): CSSProperties =>
  ({
    '--pastille-bg': `var(--color-data-${i}-bg)`,
    '--pastille-border': `var(--color-data-${i}-border)`,
    '--pastille-text': `var(--color-data-${i}-text)`,
    '--pastille-mark': `var(--color-data-${i}-mark)`,
  }) as CSSProperties;

export const EchelleDeDonnees: StoryObj = {
  name: 'Échelle de données',
  render: () => {
    const count = Number(getComputedStyle(document.documentElement).getPropertyValue('--data-count')) || 4;
    const steps = Array.from({ length: count }, (_, i) => i + 1);
    const thresholds = steps.slice(0, -1).map((i) => Number(getComputedStyle(document.documentElement).getPropertyValue(`--data-threshold-${i}`)));
    const label = (i: number) => `Palier ${i} sur ${count}`;
    return (
      <Page title="Échelle de données">
        <p>Des statuts, des niveaux, des risques : la marque fixe le nombre de paliers (4 ou 6) et leurs seuils. Les composants lisent « palier N » ; passer de 4 à 6 paliers ne change aucun composant. Cette page affiche l’échelle de la marque active : {count} paliers.</p>
        <Section title="Pastilles">
          <div className="doc__row">
            {steps.map((i) => (
              <span key={i} className="pastille" style={stepStyle(i)}>{label(i)}</span>
            ))}
          </div>
        </Section>
        <Section title="Repères graphiques">
          <div className="scale">
            {steps.map((i) => (
              <span key={i} style={stepStyle(i)} />
            ))}
          </div>
        </Section>
        <Section title="Seuils">
          <Table
            head={['Palier', 'De', 'À (exclu)']}
            rows={steps.map((i, k) => [label(i), String(k === 0 ? 0 : thresholds[k - 1]), String(k === steps.length - 1 ? 100 : thresholds[k])])}
          />
          <p className="doc__muted">Passer la marque en « Démonstration » dans la barre d’outils : l’échelle passe de 4 à 6 paliers.</p>
        </Section>
      </Page>
    );
  },
};

export const Typographie: StoryObj = {
  render: () => {
    const roles = [...new Set(withPrefix('role.type.').map((t) => t.id.split('.')[2] ?? ''))];
    return (
      <Page title="Typographie">
        <p>Les familles sont déclarées par la marque, auto-hébergées. Les chiffres sont tabulaires. Le gras est réservé aux titres.</p>
        <Section title="Rôles typographiques">
          <div>
            {roles.map((r) => {
              const w = tokens.find((t) => t.id === `role.type.${r}.weight`);
              const cap = tokens.some((t) => t.id === `role.type.${r}.caps`);
              const tr = tokens.some((t) => t.id === `role.type.${r}.tracking`);
              return (
                <div key={r} className="type-sample">
                  <div className="type-sample__meta">
                    <code>--type-{r}</code>
                    <br />
                    {w?.description}
                  </div>
                  <div style={{ font: `var(--type-${r})`, letterSpacing: tr ? `var(--type-${r}-tracking)` : undefined, textTransform: cap ? 'uppercase' : undefined, fontVariantNumeric: 'var(--numeric-tabular)' }}>
                    {r.startsWith('figure') ? '1 234,56 €  98,60 %' : 'Les cinq étages du SDK'}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
        <Section title="Chiffres tabulaires">
          <div className="demo-block" style={{ font: 'var(--type-figure-sm)', fontVariantNumeric: 'var(--numeric-tabular)' }}>
            {['1 111,11 €', '2 222,22 €', '8 888,88 €', '9 999,99 €'].map((v) => (
              <div key={v} style={{ textAlign: 'right' }}>{v}</div>
            ))}
          </div>
        </Section>
      </Page>
    );
  },
};

export const EspacementsEtFormes: StoryObj = {
  name: 'Espacements et formes',
  render: () => (
    <Page title="Espacements et formes">
      <Section title="Espacements (base de 4 px)">
        <Table
          head={['Variable', 'Valeur', '']}
          rows={withPrefix('value.space.').map((t) => [<code key="c">{t.css}</code>, `${show(rawValue(t.id))} px`, <div key="b" className="space-bar" style={{ width: `var(${t.css})` }} />])}
        />
      </Section>
      <Section title="Rayons">
        <div className="doc__grid">
          {withPrefix('role.radius.').map((t) => (
            <div key={t.id} className="doc__card">
              <div className="shape-box" style={{ borderRadius: `var(${t.css})` }} />
              <code>{t.css}</code>
              <span className="doc__muted">{show(rawValue(t.id))} px</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Ombres">
        <div className="doc__grid">
          {withPrefix('role.shadow.').map((t) => (
            <div key={t.id} className="doc__card" style={{ background: 'var(--background)' }}>
              <div className="shadow-box" style={{ boxShadow: `var(${t.css})` }} />
              <code>{t.css}</code>
              <span className="doc__muted">{t.description}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Hauteurs de contrôle (deux densités)">
        <Table
          head={['Variable', 'Valeur dans la densité active', 'Usage']}
          rows={withPrefix('role.control.').concat(withPrefix('role.row.')).map((t) => [<code key="c">{t.css}</code>, `${show(rawValue(t.id))} px`, t.description])}
        />
        <p className="doc__muted">La densité confortable s’active dans la barre d’outils. Sous un pointeur grossier, les contrôles passent à la cible tactile de 44 px.</p>
      </Section>
    </Page>
  ),
};

export const Mouvement: StoryObj = {
  render: () => (
    <Page title="Mouvement">
      <p>Avec le réglage « réduire les animations » du système, les durées de déplacement tombent à 0,01 ms et les points ci-dessous restent immobiles.</p>
      <Section title="Durées">
        <Table
          head={['Variable', 'Valeur', 'Usage', '']}
          rows={withPrefix('value.motion.duration.').map((t) => [
            <code key="c">{t.css}</code>,
            `${show(rawValue(t.id))} ms`,
            t.description,
            <div key="m" className="motion-track" style={{ minWidth: 'calc(var(--space-32) * 2)', ['--motion-duration' as string]: `var(${t.css})` }}>
              <div className="motion-dot" />
            </div>,
          ])}
        />
      </Section>
      <Section title="Courbes">
        <Table
          head={['Variable', 'Valeur', 'Usage', '']}
          rows={withPrefix('value.motion.ease.').map((t) => [
            <code key="c">{t.css}</code>,
            show(rawValue(t.id)),
            t.description,
            <div key="m" className="motion-track" style={{ minWidth: 'calc(var(--space-32) * 2)', ['--motion-ease' as string]: `var(${t.css})` }}>
              <div className="motion-dot" />
            </div>,
          ])}
        />
      </Section>
    </Page>
  ),
};
