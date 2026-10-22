import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section, Table } from './lib/ui';
import { fontDeclarations } from './lib/fonts-data';

const meta: Meta = { title: 'Documentation', parameters: { layout: 'fullscreen' } };
export default meta;

export const CreerUneMarque: StoryObj = {
  name: 'Créer une marque',
  render: () => (
    <Page title="Créer une marque">
      <Section>
        <p>Une marque est un petit paquet : un fichier de jetons qui remplace des rôles, ses polices et leurs licences, ses logos, les paliers de son échelle de données. Le SDK n’en contient aucune.</p>
      </Section>
      <Section title="Les cinq fichiers">
        <Table
          head={['Fichier', 'Rôle']}
          rows={[
            [<code key="a">brand.json</code>, 'Identité : id, nom, fichiers de jetons et de polices, nombre de paliers de données.'],
            [<code key="b">tokens.json</code>, 'Jetons DTCG 2025.10 : remplace des valeurs (palette, familles) et des rôles. Rien d’autre n’est à écrire.'],
            [<code key="c">fonts.json</code>, 'Familles (titres, texte, chiffres, code), fichiers woff2, licence, repli par support.'],
            [<code key="d">fonts/</code>, 'Les fichiers woff2 et la licence de chaque famille. Aucune URL distante.'],
            [<code key="e">logo/</code>, 'Symbole, logo complet, mot seul : clair, sombre, monochrome (lot 2).'],
          ]}
        />
      </Section>
      <Section title="Brancher en trois lignes">
        <p>Côté web, la feuille de la marque passe après celle du SDK :</p>
        <pre className="doc__card"><code>{`@import "@le-socle/sdk/tokens.css";
@import "@le-socle/sdk/theme.css";
@import "@ma-societe/marque/brand.css";   /* après le SDK */`}</code></pre>
        <p>Côté valeurs brutes (e-mail, PowerPoint, graphiques), le paquet de la marque exporte le même objet que le SDK :</p>
        <pre className="doc__card"><code>{`import { neutral, raw } from '@le-socle/sdk/tokens';
import brand from '@ma-societe/marque';
raw(brand, 'role.color.action.base');   // "#…" pour la marque
raw(neutral, 'role.color.action.base'); // "#…" pour le neutre`}</code></pre>
      </Section>
      <Section title="Ce que la marque change">
        <Table
          head={['Je veux changer', 'Je modifie dans tokens.json']}
          rows={[
            ['La couleur principale', <code key="1">value.palette.primary.*</code>],
            ['L’accent', <code key="2">value.palette.accent.*</code>],
            ['Les gris', <code key="3">value.palette.neutral.*</code>],
            ['Les rayons', <code key="4">role.radius.sm|md|lg|xl</code>],
            ['Un rôle précis (le bouton, le lien)', <code key="5">role.color.action.base</code>],
            ['Le nombre de paliers de données (4 ou 6)', <code key="6">role.data.count et role.data.threshold.*</code>],
            ['Les polices', <code key="7">value.font.family.*</code> + 'fonts.json'],
          ]}
        />
      </Section>
      <Section title="Les contrôles qui vous protègent">
        <p>
          <code>npm run check:tokens</code> (format et couches), <code>npm run check:contrast</code> (WCAG 2.2 AA sur clair, sombre et surfaces sombres), <code>npm run check:brands</code> (aucun nom de marque dans le SDK).
        </p>
      </Section>
    </Page>
  ),
};

export const Polices: StoryObj = {
  render: () => (
    <Page title="Polices">
      <Section>
        <p>La marque déclare ses familles dans <code>fonts.json</code>, avec leurs fichiers et leur licence. Les polices sont auto-hébergées : l’application les sert, aucun appel à un service de polices tiers.</p>
      </Section>
      {fontDeclarations().map((f) => (
        <Section key={f.role} title={`${f.family} (${f.role})`}>
          <p className="demo-block" style={{ fontFamily: `"${f.family}"` }}>Les cinq étages du SDK, 0123456789 · 1 234,56 €</p>
          <Table
            head={['Support', 'Police de repli']}
            rows={[
              ['Web', f.fallbacks.web],
              ['E-mail', f.fallbacks.email],
              ['PowerPoint', f.fallbacks.powerpoint],
              ['PDF', f.fallbacks.pdf],
            ]}
          />
          <p className="doc__muted">Licence {f.license}.</p>
        </Section>
      ))}
    </Page>
  ),
};
