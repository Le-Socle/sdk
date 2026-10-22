import type { Meta, StoryObj } from '@storybook/react-vite';
import { InboxIcon } from 'lucide-react';
import { Button } from '../../src/ui/button';
import { EmptyState, ErrorState, LoadingRows } from '../../src/app/components/states';
import { StatBand, type StatItem } from '../../src/app/components/stat-band';
import { Pill } from '../../src/app/components/pill';
import { UserAvatar } from '../../src/app/components/user-avatar';
import { DemoEngine } from '../lib/app-demo';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta = { title: 'Application/États et chiffres', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

export const EtatsCommuns: Story = {
  name: 'États vide, erreur, chargement',
  render: () => (
    <DemoEngine>
      <Matrix>
        <div className="flex w-full max-w-96 flex-col gap-6">
          <EmptyState icon={InboxIcon} title="Aucun projet" description="Créez un premier projet pour le voir apparaître ici." action={<Button size="sm">Nouveau projet</Button>} />
          <EmptyState compact title="Aucune personne liée" />
          <ErrorState message="La source de données ne répond pas." onRetry={() => undefined} />
          <LoadingRows rows={4} />
        </div>
      </Matrix>
    </DemoEngine>
  ),
};

/** Segment du bandeau : la teinte est un nom symbolique que la marque met en couleur. */
const seg = (label: string, value: number, tint: string) => ({ label, value, color: tint });

const ITEMS: StatItem[] = [
  { key: 'total', label: 'Projets', value: '16', chart: { type: 'spark', data: [3, 5, 4, 8, 6, 9, 12, 10, 11, 14, 13, 16], labels: Array.from({ length: 12 }, (_, i) => `S${i + 1}`) } },
  { key: 'late', label: 'En retard', value: '4', tone: 'danger', hint: 'Dont 2 bloqués' },
  { key: 'budget', label: 'Budget engagé', value: '412 300,50 €', tone: 'default', hint: 'Sur 600 000,00 € prévus' },
  {
    key: 'status',
    label: 'Par statut',
    value: '',
    chart: {
      type: 'segments',
      data: [seg('En cours', 7, 'blue'), seg('En revue', 3, 'amber'), seg('Bloqué', 2, 'red'), seg('Terminé', 4, 'green')],
    },
  },
  { key: 'load', label: 'Charge de l’équipe', value: '86 %', chart: { type: 'gauge', value: 86, max: 100, alert: 80 } },
  {
    key: 'funnel',
    label: 'Parcours',
    value: '',
    wide: true,
    chart: {
      type: 'funnel',
      data: [
        { label: 'Idées', value: 40 },
        { label: 'Cadrés', value: 28 },
        { label: 'Lancés', value: 16 },
        { label: 'Livrés', value: 9 },
      ],
    },
  },
  { key: 'click', label: 'Cliquable', value: '3', hint: 'Ouvre la liste filtrée', onClick: () => undefined },
];

export const BandeauDeChiffres: Story = {
  name: 'Bandeau de chiffres',
  render: () => (
    <DemoEngine>
      <Matrix cols={1}>
        <div className="flex w-full flex-col gap-4">
          <StatBand items={ITEMS} />
          <StatBand items={ITEMS.slice(0, 3)} loading />
          <StatBand items={ITEMS.slice(0, 3)} compact />
        </div>
      </Matrix>
    </DemoEngine>
  ),
};

export const PastillesEtAvatars: Story = {
  name: 'Pastilles et avatars',
  render: () => (
    <DemoEngine>
      <Matrix>
        <Row label="Tons">
          {['gray', 'blue', 'green', 'amber', 'red', 'violet'].map((c) => (
            <Pill key={c} color={c}>
              {c}
            </Pill>
          ))}
        </Row>
        <Row label="Avatars">
          {['Camille Fontaine', 'Louis Marchand', 'Inès Rousseau', 'Hélène Dubois'].map((n) => (
            <UserAvatar key={n} name={n} />
          ))}
        </Row>
      </Matrix>
    </DemoEngine>
  ),
};
