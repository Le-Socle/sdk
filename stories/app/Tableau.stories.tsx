import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { BulkBar } from '../../src/app/components/bulk-bar';
import { DataTable } from '../../src/app/components/data-table';
import { FilterBar } from '../../src/app/components/filter-bar';
import { demoObjects, demoRows } from '../../src/app/demo';
import type { Filter, Sort } from '../../src/app/engine/types';
import { EditableField } from '../../src/app/fields/editable-field';
import { RecordDrawerHost } from '../../src/app/drawer/record-drawer';
import { DemoEngine } from '../lib/app-demo';
import { Matrix } from '../lib/matrix';

const meta: Meta = { title: 'Application/Tableau', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

const project = demoObjects[0]!;
const rows = demoRows.project!.slice(0, 8);

function Sortable({ selectable }: { selectable?: boolean }) {
  const [sort, setSort] = React.useState<Sort[]>([{ key: 'budget', dir: 'desc' }]);
  const sorted = React.useMemo(() => [...rows].sort((a, b) => (sort[0]?.dir === 'desc' ? -1 : 1) * (Number(a[sort[0]!.key] ?? -1) - Number(b[sort[0]!.key] ?? -1))), [sort]);
  return <DataTable def={project} rows={sorted} sort={sort} onSortChange={setSort} selectable={selectable} editable />;
}

export const TableauParObjet: Story = {
  name: 'Piloté par un objet',
  render: () => (
    <DemoEngine>
      <Matrix cols={1}>
        <div className="w-full">
          <Sortable />
        </div>
      </Matrix>
    </DemoEngine>
  ),
};

export const TableauColonnesExplicites: Story = {
  name: 'Colonnes explicites',
  render: () => (
    <DemoEngine>
      <Matrix cols={1}>
        <div className="w-full">
          <DataTable
            label="Actions du plan"
            rows={[
              { id: 'a1', name: 'Mettre en place une charte', effort: 3, gain: 0.4 },
              { id: 'a2', name: 'Revoir le processus d’avenants', effort: 7, gain: 1.2 },
              { id: 'a3', name: 'Former les équipes', effort: 5, gain: 0.8 },
            ]}
            columns={[
              { key: 'name', header: 'Action', width: 80, cell: (r) => <span className="block truncate">{String(r.name)}</span> },
              { key: 'effort', header: 'Effort', width: 24, align: 'end', cell: (r) => <span className="tabular-nums">{String(r.effort)}</span> },
              { key: 'gain', header: 'Gain', width: 24, align: 'end', cell: (r) => <span className="tabular-nums">{Number(r.gain).toFixed(2)}</span> },
            ]}
          />
        </div>
      </Matrix>
    </DemoEngine>
  ),
};

export const TableauSelection: Story = {
  name: 'Sélection et actions groupées',
  render: () => {
    function S() {
      const [sel, setSel] = React.useState<string[]>(['j1', 'j3']);
      return (
        <>
          <DataTable def={project} rows={rows} selectable selection={sel} onSelectionChange={setSel} />
          {sel.length ? <BulkBar def={project} ids={sel} rows={rows.filter((r) => sel.includes(r.id))} onDone={() => setSel([])} /> : null}
        </>
      );
    }
    return (
      <DemoEngine>
        <S />
      </DemoEngine>
    );
  },
};

export const TableauGroupe: Story = {
  name: 'Groupé par statut',
  render: () => (
    <DemoEngine>
      <DataTable def={project} rows={demoRows.project} groupBy="status" />
    </DemoEngine>
  ),
};

export const TableauVide: Story = {
  name: 'Vide, chargement, erreur',
  render: () => (
    <DemoEngine>
      <div className="flex flex-col gap-8">
        <DataTable def={project} rows={[]} empty={{ title: 'Aucun projet', description: 'Aucun projet ne correspond aux filtres.' }} />
        <DataTable def={project} rows={undefined} loading />
        <DataTable def={project} rows={undefined} error={new Error('La source de données ne répond pas.')} onRetry={() => undefined} />
      </div>
    </DemoEngine>
  ),
};

export const TableauLigneActive: Story = {
  name: 'Ligne active et action de ligne',
  render: () => (
    <DemoEngine>
      <DataTable def={project} rows={rows} activeId="j2" onRowClick={() => undefined} rowAction={() => <span className="type-label-sm text-muted-foreground">Ouvrir</span>} />
    </DemoEngine>
  ),
};

const FILTERS: Filter[] = [
  { field: 'status', op: 'in', value: ['active', 'review'] },
  { field: 'budget', op: 'gte', value: 20000 },
  { field: 'owner_id', op: 'in', value: ['m1'], labels: { m1: 'Camille Fontaine' } },
];

export const BarreDeFiltres: Story = {
  name: 'Barre de filtres',
  render: () => {
    function F({ initial }: { initial: Filter[] }) {
      const [f, setF] = React.useState(initial);
      return <FilterBar def={project} filters={f} onChange={setF} />;
    }
    return (
      <DemoEngine>
        <Matrix>
          <div className="flex w-full flex-col gap-4">
            <F initial={[]} />
            <F initial={FILTERS} />
          </div>
        </Matrix>
      </DemoEngine>
    );
  },
};

export const ChampEnEdition: Story = {
  name: 'Champ en édition (même hauteur)',
  render: () => (
    <DemoEngine>
      <div className="flex w-full max-w-120 flex-col gap-4 p-4">
        <p className="type-label text-muted-foreground">Au repos</p>
        <div className="border-b border-divider"><EditableField object="project" id="j1" field={project.fields[0]!} value={rows[0]!.name} row={rows[0]} /></div>
        <p className="type-label text-muted-foreground">Édition ouverte (liste d’options)</p>
        <div className="h-72"><EditableField object="project" id="j1" field={project.fields[1]!} value={rows[0]!.status} row={rows[0]} defaultOpen /></div>
      </div>
    </DemoEngine>
  ),
};

export const FicheTiroir: Story = {
  name: 'Fiche latérale',
  render: () => (
    <DemoEngine initialPath="/projets?d=project.j2~person.p1">
      <DataTable def={project} rows={rows} activeId="j2" />
      <RecordDrawerHost />
    </DemoEngine>
  ),
};
