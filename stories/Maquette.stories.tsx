import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Page, Section } from './lib/ui';

const meta: Meta = { title: 'Jetons/Maquette', parameters: { layout: 'fullscreen' } };
export default meta;

const stepStyle = (i: number): CSSProperties =>
  ({
    '--pastille-bg': `var(--color-data-${i}-bg)`,
    '--pastille-border': `var(--color-data-${i}-border)`,
    '--pastille-text': `var(--color-data-${i}-text)`,
    '--pastille-mark': `var(--color-data-${i}-mark)`,
  }) as CSSProperties;

/** Mini-maquette en HTML et CSS purs : elle ne lit que les rôles (variables CSS). Aucun composant du
 * SDK n'existe encore ; elle montre ce que les jetons produisent sur un écran d’application. */
function Mock() {
  const count = Number(getComputedStyle(document.documentElement).getPropertyValue('--data-count')) || 4;
  const rows = [
    ['Rapport trimestriel', 'Marie Lambert', '12 480,00 €', 1],
    ['Audit de sécurité', 'Karim Benali', '8 900,00 €', Math.min(2, count)],
    ['Migration des données', 'Sophie Martin', '23 150,50 €', Math.min(3, count)],
    ['Refonte du portail', 'Julien Petit', '41 000,00 €', count],
  ] as const;
  return (
    <div className="mock">
      <aside className="mock__side">
        <div className="mock__brand">Mon organisation</div>
        <div className="mock__nav mock__nav--active">Tableau de bord</div>
        <div className="mock__nav mock__nav--hover">Projets</div>
        <div className="mock__nav">Équipes</div>
        <div className="mock__nav">Réglages</div>
      </aside>
      <div className="mock__main">
        <div className="mock__head">
          <h2>Tableau de bord</h2>
          <button type="button" className="demo-button">Nouveau projet</button>
        </div>
        <div className="mock__kpis">
          {[['Chiffre d’affaires', '85 530,50 €'], ['Projets actifs', '24'], ['Taux de réussite', '96,40 %']].map(([l, v]) => (
            <div key={l} className="demo-card">
              <span className="mock__kpi-label">{l}</span>
              <span className="mock__kpi-value">{v}</span>
            </div>
          ))}
        </div>
        <div className="demo-card">
          <h3>Projets</h3>
          <div className="doc__scroll">
            <table className="doc__table">
              <thead><tr><th>Projet</th><th>Responsable</th><th>Montant</th><th>État</th></tr></thead>
              <tbody>
                {rows.map(([p, r, m, s]) => (
                  <tr key={p}>
                    <td>{p}</td>
                    <td>{r}</td>
                    <td style={{ textAlign: 'right' }}>{m}</td>
                    <td><span className="pastille" style={stepStyle(s)}>Palier {s} sur {count}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Maquette: StoryObj = {
  render: () => (
    <Page title="Maquette d’application">
      <p>Du HTML et du CSS purs qui lisent seulement les rôles. Changer la marque, le thème ou la densité dans la barre d’outils change tout.</p>
      <Section title="Fond clair"><Mock /></Section>
      <Section title="Surface sombre"><div data-surface="dark"><Mock /></div></Section>
      <Section title="Thème sombre complet"><div data-theme="dark"><Mock /></div></Section>
    </Page>
  ),
};
