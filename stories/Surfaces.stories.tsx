import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Page, Section } from './lib/ui';

const meta: Meta = { title: 'Jetons/Surfaces et thèmes', parameters: { layout: 'fullscreen' } };
export default meta;

/** Le même bloc, posé sur quatre fonds : les composants lisent les mêmes noms, seuls les rôles bougent. */
function Bloc({ titre, children }: { titre: string; children?: ReactNode }) {
  return (
    <div className="demo-block">
      <span className="demo-block__label">{titre}</span>
      <h3>Titre de section</h3>
      <p>Texte courant sur ce fond. <a className="demo-link" href="#lien">Un lien</a>, du <span className="doc__muted">texte atténué</span> et le chiffre 1 234,56 €.</p>
      <div className="demo-card">
        <h3>Une carte</h3>
        <p className="doc__muted">Surface posée sur le fond.</p>
        <button type="button" className="demo-button">Action principale</button>
      </div>
      <button type="button" className="demo-button demo-button--secondary">Action secondaire</button>
      {children}
    </div>
  );
}

export const SurfacesEtThemes: StoryObj = {
  name: 'Surfaces et thèmes',
  render: () => (
    <Page title="Surfaces et thèmes">
      <p>Clair par défaut. Une section sombre s’obtient avec <code>data-surface=&quot;dark&quot;</code> ou <code>&quot;darker&quot;</code> ; le thème sombre complet avec <code>data-theme=&quot;dark&quot;</code>. Dans les deux cas, les composants s’adaptent seuls.</p>
      <Section>
        <div className="doc__pair">
          <Bloc titre="Fond clair" />
          <div data-surface="dark"><Bloc titre="Surface sombre : data-surface=dark" /></div>
          <div data-surface="darker"><Bloc titre="Surface la plus sombre : data-surface=darker" /></div>
          <div data-theme="dark"><Bloc titre="Thème sombre complet : data-theme=dark" /></div>
        </div>
      </Section>
    </Page>
  ),
};

export const SurfaceClair: StoryObj = { name: 'Fond clair', render: () => <Page title="Fond clair"><Bloc titre="Fond clair" /></Page> };
export const SurfaceSombre: StoryObj = { name: 'Surface sombre', render: () => <Page title="Surface sombre"><div data-surface="dark"><Bloc titre="data-surface=dark" /></div></Page> };
