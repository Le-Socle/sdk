import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle } from '../../src/ui/card';
import { Arc, BarChart, Distribution, FiguresTable, Gauge, HeatMatrix, LineChart, ProgressBar, StatusPill, type DataScale } from '../../src/ui/charts';
import { Frame } from '../lib/frame';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta = { title: 'Composants/Graphiques et données', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

// Données d'exemple : un suivi de maturité sur 100 par domaine, et un chiffre d'affaires.
const DOMAINES = [
  { domaine: 'Gouvernance', score: 82 },
  { domaine: 'Sécurité', score: 64 },
  { domaine: 'Données', score: 47 },
  { domaine: 'Continuité', score: 91 },
  { domaine: 'Fournisseurs', score: 28 },
  { domaine: 'Formation', score: 71 },
];
const MOIS = [
  { mois: 'Mai', ca: 38200, prevu: 36000 },
  { mois: 'Juin', ca: 41250.5, prevu: 40000 },
  { mois: 'Juil.', ca: 39800, prevu: 42000 },
  { mois: 'Août', ca: 33100, prevu: 38000 },
  { mois: 'Sept.', ca: 47600, prevu: 44000 },
  { mois: 'Oct.', ca: 52480, prevu: 48000 },
];
const euro = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const TRAJECTOIRE = [
  { mesure: 'M1', score: 31 },
  { mesure: 'M3', score: 44 },
  { mesure: 'M6', score: 58 },
  { mesure: 'M9', score: 63 },
  { mesure: 'M12', score: 79 },
];
const MATRICE = {
  columns: ['Prévenir', 'Détecter', 'Réagir', 'Reprendre'],
  rows: [
    { label: 'Postes', values: [82, 64, 47, 91] },
    { label: 'Serveurs', values: [28, 71, 55, null] },
    { label: 'Messagerie', values: [93, 88, 36, 59] },
    { label: 'Sites', values: [45, 22, 67, 78] },
  ],
};
const TABLEAU = {
  columns: [
    { key: 'projet', label: 'Projet' },
    { key: 'budget', label: 'Budget', format: 'euro' as const },
    { key: 'engage', label: 'Engagé', format: 'euro' as const },
    { key: 'avancement', label: 'Avancement', format: 'percent' as const },
  ],
  rows: [
    { projet: 'Rapport trimestriel', budget: 12480, engage: 9120.5, avancement: 73 },
    { projet: 'Audit de sécurité', budget: 8900, engage: 8900, avancement: 100 },
    { projet: 'Migration des données', budget: 23150.5, engage: 6400, avancement: 28 },
  ],
  total: { projet: 'Total', budget: 44530.5, engage: 24420.5, avancement: 55 },
};
const ECHELLE_4: DataScale = { count: 4, thresholds: [25, 50, 75] };
const ECHELLE_6: DataScale = { count: 6, thresholds: [17, 33, 50, 67, 83] };
const LIBELLES_4 = ['Solide', 'Correct', 'Fragile', 'Critique'];
const LIBELLES_6 = ['Excellent', 'Solide', 'Correct', 'Fragile', 'Critique', 'Alerte'];

function Cadre({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      {children}
    </Card>
  );
}

/** Une page d'application : tous les graphiques sur la marque et le thème de la barre d'outils. */
export const DansUnePage: Story = {
  name: 'Dans une page',
  render: () => (
    <div className="mx__single" style={{ width: '100%', alignItems: 'stretch' }}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Cadre title="Chiffre d’affaires mensuel">
          <LineChart
            data={MOIS}
            categoryKey="mois"
            series={[{ key: 'ca', label: 'Réalisé' }, { key: 'prevu', label: 'Prévu' }]}
            formatValue={euro}
            summary="Chiffre d’affaires de mai à octobre : de 38 200 € à 52 480 €, au-dessus du prévu en octobre."
          />
        </Cadre>
        <Cadre title="Maturité par domaine">
          <BarChart
            layout="horizontal"
            data={DOMAINES}
            categoryKey="domaine"
            series={[{ key: 'score', label: 'Score' }]}
            tiered
            higherIsBetter
            domain={[0, 100]}
            summary="Score de maturité par domaine : Continuité 91, Gouvernance 82, Formation 71, Sécurité 64, Données 47, Fournisseurs 28."
          />
        </Cadre>
        <Cadre title="Trajectoire du score">
          <LineChart data={TRAJECTOIRE} categoryKey="mesure" series={[{ key: 'score', label: 'Score' }]} domain={[0, 100]} showValues reference={50} target={75} summary="Le score passe de 31 à M1 à 79 à M12 ; référence 50, cible 75." />
        </Cadre>
        <Cadre title="Répartition des domaines par palier">
          <div className="flex flex-col gap-6 p-1">
            <Distribution counts={[2, 2, 1, 1, 0, 0]} />
            <Row label="Pastilles de statut">
              <StatusPill tier={1} label="Solide" srPrefix="Niveau : " />
              <StatusPill tier={2} label="Correct" srPrefix="Niveau : " />
              <StatusPill tier={3} label="Fragile" srPrefix="Niveau : " />
              <StatusPill tier={4} label="Critique" srPrefix="Niveau : " />
            </Row>
          </div>
        </Cadre>
        <Cadre title="Indicateurs">
          <div className="flex flex-wrap items-end gap-8 p-1">
            <Arc label="Maturité globale" value={72} tiered higherIsBetter reference={60} target={80} />
            <div className="flex min-w-48 flex-1 flex-col gap-4"><Gauge label="Sécurité" value={64} higherIsBetter className="max-w-64" /></div>
            <div className="flex w-full flex-col gap-3">
              <ProgressBar value={82} tiered higherIsBetter reference={70} target={90} aria-label="Gouvernance" />
              <ProgressBar value={47} tiered higherIsBetter reference={40} target={60} aria-label="Données" />
              <ProgressBar value={null} aria-label="Fournisseurs non évalués" />
            </div>
          </div>
        </Cadre>
        <Cadre title="Matrice des mesures">
          <HeatMatrix caption="Maturité par actif et par fonction" higherIsBetter {...MATRICE} />
          <HeatMatrix caption="Maturité sur 5 par fonction" higherIsBetter domain={[0, 5]} columns={['Prévenir', 'Détecter', 'Réagir']} rows={[{ label: 'Postes', values: [4.1, 3.2, 2.75] }, { label: 'Serveurs', values: [1.4, 3.6, null] }]} />
        </Cadre>
        <Cadre title="Budgets des projets" className="md:col-span-2">
          <FiguresTable caption="Budgets et avancement des projets" {...TABLEAU} />
        </Cadre>
      </div>
    </div>
  ),
};

/** Les mêmes briques à plat sur les quatre cellules : fond clair, surface sombre, deux densités. */
export const SurfacesEtDensites: Story = {
  name: 'Clair, sombre, deux densités',
  render: () => (
    <Matrix>
      <Row label="Pastilles, barres, arc"><StatusPill tier={1} label="Solide" /><StatusPill tier={2} label="Correct" /><StatusPill tier={3} label="Fragile" /><StatusPill tier={4} label="Critique" /></Row>
      <div className="flex w-full flex-col gap-3"><ProgressBar value={82} tiered higherIsBetter aria-label="Gouvernance" /><ProgressBar value={47} tiered higherIsBetter aria-label="Données" /><ProgressBar value={21} tiered aria-label="Fournisseurs" /></div>
      <div className="flex items-end gap-6"><Arc label="Maturité" value={72} tiered higherIsBetter size="sm" /><Gauge label="Sécurité" value={64} higherIsBetter className="w-44" /></div>
      <Distribution counts={[2, 2, 1, 1, 0, 0]} />
      <HeatMatrix caption="Maturité" higherIsBetter {...MATRICE} />
      <BarChart data={DOMAINES} categoryKey="domaine" series={[{ key: 'score', label: 'Score' }]} tiered higherIsBetter domain={[0, 100]} summary="Score par domaine." areaClassName="h-48" className="w-full" />
      <LineChart data={MOIS} categoryKey="mois" series={[{ key: 'ca', label: 'Réalisé' }, { key: 'prevu', label: 'Prévu' }]} formatValue={euro} summary="Chiffre d’affaires." areaClassName="h-48" className="w-full" />
    </Matrix>
  ),
};

/** L'échelle passe de 4 à 6 paliers : mêmes composants, mêmes données, seule l'échelle change. */
export const Echelle4Et6: Story = {
  name: 'Échelle de 4 à 6 paliers',
  render: () => (
    <div className="mx__single" style={{ width: '100%', alignItems: 'stretch' }}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {([[ECHELLE_4, LIBELLES_4, '4 paliers (marque neutre)'], [ECHELLE_6, LIBELLES_6, '6 paliers (marque de démonstration)']] as const).map(([scale, labels, titre]) => (
          <Cadre key={titre} title={titre}>
            <div className="flex flex-col gap-6 p-1" data-echelle={scale.count}>
              <Row label="Pastilles">{labels.map((l, i) => <StatusPill key={l} tier={i + 1} label={l} />)}</Row>
              <Distribution scale={scale} counts={[3, 4, 5, 2, 1, 1]} tierLabels={[...labels]} />
              <Gauge label="Maturité" value={58} higherIsBetter scale={scale} tierLabels={[...labels]} />
              <BarChart layout="horizontal" scale={scale} tiered higherIsBetter data={DOMAINES} categoryKey="domaine" series={[{ key: 'score', label: 'Score' }]} domain={[0, 100]} summary="Score par domaine." areaClassName="h-56" />
              <HeatMatrix scale={scale} higherIsBetter caption="Maturité" {...MATRICE} />
            </div>
          </Cadre>
        ))}
      </div>
    </div>
  ),
};

function SlideContenu({ size }: { size: 'lg' }) {
  return (
    <>
      <h2 className="type-display text-heading">Maturité par domaine</h2>
      <div className="grid flex-1 grid-cols-[3fr_2fr] gap-16">
        <BarChart layout="horizontal" size={size} data={DOMAINES} categoryKey="domaine" series={[{ key: 'score', label: 'Score' }]} tiered higherIsBetter domain={[0, 100]} summary="Score de maturité par domaine." areaClassName="h-180!" />
        <div className="flex flex-col justify-center gap-12">
          <Distribution size={size} counts={[2, 2, 1, 1, 0, 0]} />
          <div className="flex items-center gap-10">
            <Arc label="Maturité globale" value={72} tiered higherIsBetter size="lg" />
            <div className="flex flex-col gap-2"><span className="type-display text-heading">72</span><span className="type-lede text-muted-foreground">sur 100</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Cadre simple de slide (1920 × 1080) : le vrai support de slide viendra avec les archétypes. */
export const DansUneSlide: Story = {
  name: 'Dans une slide 1920 × 1080',
  render: () => (
    <Frame kind="slide" label="Cadre 1920 × 1080, mis à l’échelle de la fenêtre">
      <SlideContenu size="lg" />
    </Frame>
  ),
};

/** Cadre simple de visuel carré (1080 × 1080). */
export const DansUnVisuel: Story = {
  name: 'Dans un visuel 1080 × 1080',
  render: () => (
    <Frame kind="visuel" label="Cadre 1080 × 1080, mis à l’échelle de la fenêtre">
      <h2 className="type-title text-heading">Chiffre d’affaires, mai à octobre</h2>
      <LineChart size="lg" data={MOIS} categoryKey="mois" series={[{ key: 'ca', label: 'Réalisé' }, { key: 'prevu', label: 'Prévu' }]} formatValue={euro} summary="Chiffre d’affaires mensuel, de 38 200 € à 52 480 €." areaClassName="h-96!" />
      <Distribution size="lg" counts={[2, 2, 1, 1, 0, 0]} />
    </Frame>
  ),
};
