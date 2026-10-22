import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section, Table } from './lib/ui';

const meta: Meta = { title: 'Accueil', parameters: { layout: 'fullscreen' } };
export default meta;

const ETAGES: { n: string; nom: string; dossier: string; contenu: string; etat: string }[] = [
  { n: '1', nom: 'Jetons', dossier: 'tokens/, brands/', contenu: 'Couleurs, typographie, espacements, rayons, ombres, mouvement : une source pour tous les supports, en trois couches (valeurs, rôles, composants).', etat: 'Lot 1 : en place' },
  { n: '2', nom: 'Composants', dossier: 'src/ui/', contenu: 'Boutons, cartes, champs, graphiques : briques génériques qui lisent les rôles.', etat: 'Lot 2 : à venir' },
  { n: '3', nom: 'Archétypes', dossier: 'src/site, slides, document, email, social, app', contenu: 'Pour chaque support, les types de blocs à partir desquels on compose un écran.', etat: 'Lot 3 : squelettes' },
  { n: '4', nom: 'Gabarits', dossier: 'templates/', contenu: 'Un site, un deck, une proposition, une annonce prêts à remplir.', etat: 'Plus tard' },
  { n: '5', nom: 'Rendu', dossier: 'src/render/', contenu: 'Page en ligne, PDF, PowerPoint, e-mail envoyé, image : le navigateur de rendu est une dépendance optionnelle.', etat: 'Plus tard : squelette' },
];

const SUPPORTS = [
  ['Site', '@le-socle/sdk/site', 'squelette'],
  ['Présentation', '@le-socle/sdk/slides', 'squelette'],
  ['Document', '@le-socle/sdk/document', 'squelette'],
  ['E-mail', '@le-socle/sdk/email', 'squelette'],
  ['Réseaux', '@le-socle/sdk/social', 'squelette'],
  ['Application', '@le-socle/sdk/app', 'actif (moteur d’écrans à venir)'],
  ['Jetons', '@le-socle/sdk/tokens', 'actif'],
  ['Composants', '@le-socle/sdk/ui', 'actif (utilitaire de classes)'],
  ['Rendu', '@le-socle/sdk/render', 'squelette'],
];

export const CinqEtages: StoryObj = {
  name: 'Les cinq étages',
  render: () => (
    <Page title="SDK du Socle">
      <Section>
        <p>
          Un SDK sans marque pour toutes les surfaces d’une société : application, site, présentation, document, e-mail, visuel. Une société y branche ses jetons, ses polices et son logo, et toutes ses surfaces prennent le même style.
        </p>
      </Section>
      <Section title="Les cinq étages">
        <div className="doc__grid">
          {ETAGES.map((e) => (
            <article key={e.n} className="doc__card">
              <span className="doc__muted">Étage {e.n}</span>
              <h3>{e.nom}</h3>
              <p>{e.contenu}</p>
              <code>{e.dossier}</code>
              <span className="doc__muted">{e.etat}</span>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Points d’entrée du paquet">
        <Table head={['Support', 'Import', 'État']} rows={SUPPORTS.map(([a, b, c]) => [a, <code key={b}>{b}</code>, c])} />
      </Section>
      <Section title="Brancher une marque">
        <p>
          Le sélecteur de marque, en haut de Storybook, change toutes les pages. Voir « Documentation / Créer une marque » pour écrire la sienne.
        </p>
      </Section>
    </Page>
  ),
};
