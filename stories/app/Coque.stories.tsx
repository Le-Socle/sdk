import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';
import { Button } from '../../src/ui/button';
import { AppShell, PageContent, PageHeader, ScopeSwitch, SearchButton, type NavGroup } from '../../src/app/components/shell';
import { ObjectList } from '../../src/app/components/object-list';
import { RecordDrawerHost } from '../../src/app/drawer/record-drawer';
import { StatBand } from '../../src/app/components/stat-band';
import { demoObjects } from '../../src/app/demo';
import { DemoEngine, demoSession } from '../lib/app-demo';

const meta: Meta = { title: 'Application/Coque', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

const GROUPS: NavGroup[] = [
  {
    items: [
      { href: '/accueil', label: 'Accueil', icon: 'home' },
      { href: '/pilotage', label: 'Pilotage', icon: 'gauge', badge: 3 },
    ],
  },
  {
    label: 'Listes',
    items: [
      { href: '/projets', label: 'Projets', icon: 'folder' },
      { href: '/personnes', label: 'Personnes', icon: 'user' },
    ],
  },
];

const project = demoObjects[0]!;

function Page({ withDrawer = false, width }: { withDrawer?: boolean; width?: number }) {
  return (
    <AppShell groups={GROUPS} footerItems={[{ href: '/reglages', label: 'Réglages', icon: 'settings' }]}>
      <PageHeader
        title="Projets"
        breadcrumb={[{ label: 'Accueil', href: '/accueil' }, { label: 'Projets' }]}
        actions={
          <>
            <ScopeSwitch scope={demoSession.scope!} onChange={() => undefined} />
            <SearchButton onClick={() => undefined} shortcut="Ctrl K" />
            <Button size="md">
              <PlusIcon /> Nouveau projet
            </Button>
          </>
        }
      />
      <PageContent>
        <StatBand
          compact
          items={[
            { key: 'a', label: 'projets', value: '16' },
            { key: 'b', label: 'en retard', value: '4', tone: 'danger' },
          ]}
        />
        <ObjectList def={project} />
      </PageContent>
      {withDrawer ? <RecordDrawerHost /> : null}
      {width ? null : null}
    </AppShell>
  );
}

export const Bureau: Story = {
  name: 'Page de liste',
  render: () => (
    <DemoEngine>
      <Page />
    </DemoEngine>
  ),
};

export const FicheOuverte: Story = {
  name: 'Fiche ouverte (tiroir)',
  render: () => (
    <DemoEngine initialPath="/projets?d=project.j1">
      <Page withDrawer />
    </DemoEngine>
  ),
};

export const ChargementEtErreur: Story = {
  name: 'Liste en chargement',
  render: () => (
    <DemoEngine memory={{ latency: 60000 }}>
      <Page />
    </DemoEngine>
  ),
};

export const ListeEnErreur: Story = {
  name: 'Liste en erreur',
  render: () => (
    <DemoEngine memory={{ mode: 'error' }}>
      <Page />
    </DemoEngine>
  ),
};

export const ListeVide: Story = {
  name: 'Liste vide',
  render: () => (
    <DemoEngine memory={{ mode: 'empty' }}>
      <Page />
    </DemoEngine>
  ),
};

export const SansSession: Story = {
  name: 'Sans organisation ni utilisateur',
  render: () => (
    <DemoEngine session={null}>
      <AppShell groups={GROUPS} session={null}>
        <PageHeader title="Accueil" />
        <PageContent>
          <p className="type-body text-foreground">Contenu de la page.</p>
        </PageContent>
      </AppShell>
    </DemoEngine>
  ),
};
