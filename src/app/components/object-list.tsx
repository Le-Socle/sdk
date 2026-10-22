'use client';

import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '../../ui/input';
import { cn } from '../../lib/cn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useAppMessages, useDataSource } from '../engine/provider';
import { useAsync, useDebounced } from '../engine/use-async';
import type { Filter, ObjectDef, Sort } from '../engine/types';
import { useDrawer } from '../drawer/use-drawer';
import { BulkBar } from './bulk-bar';
import { DataTable } from './data-table';
import { FilterBar } from './filter-bar';

/**
 * Liste complète d'un objet : vues prédéfinies (onglets), recherche, filtres, tableau triable,
 * actions groupées, ouverture de la fiche au clic. Tout vient de l'`ObjectDef` et de la source de
 * données du moteur ; l'état (vue, filtres, tri, recherche) reste local à la liste.
 */
export function ObjectList({ def, className }: { def: ObjectDef; className?: string }) {
  const m = useAppMessages();
  const ds = useDataSource();
  const drawer = useDrawer();
  const [viewKey, setViewKey] = React.useState(def.views[0]?.key ?? '');
  const view = def.views.find((v) => v.key === viewKey);
  const [filters, setFilters] = React.useState<Filter[]>([]);
  const [sort, setSort] = React.useState<Sort[] | undefined>(undefined);
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search, 200);
  const [selection, setSelection] = React.useState<string[]>([]);

  const allFilters = React.useMemo(() => [...(view?.filters ?? []), ...filters], [view, filters]);
  const effectiveSort = sort ?? view?.sort ?? def.defaultSort;
  const list = useAsync(
    () => ds.list({ object: def.key, filters: allFilters, sort: effectiveSort, search: q }),
    [ds, def.key, JSON.stringify(allFilters), JSON.stringify(effectiveSort), q],
  );

  return (
    <div data-slot="object-list" className={cn('flex min-w-0 flex-col gap-3', className)}>
      {def.views.length > 1 ? (
        <Tabs
          value={viewKey}
          onValueChange={(v) => {
            setViewKey(v);
            setFilters([]);
            setSort(undefined);
            setSelection([]);
          }}
        >
          <TabsList>
            {def.views.map((v) => (
              <TabsTrigger key={v.key} value={v.key}>
                {v.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Les onglets pilotent la liste placée dessous : chaque panneau (vide) existe pour que aria-controls soit valide. */}
          {def.views.map((v) => (
            <TabsContent key={v.key} value={v.key} forceMount hidden />
          ))}
        </Tabs>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={m.shell.searchPlaceholder} aria-label={m.shell.search} className="pl-9" />
        </div>
        <FilterBar def={def} filters={filters} onChange={setFilters} />
      </div>
      <DataTable
        def={def}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        sort={effectiveSort}
        onSortChange={setSort}
        groupBy={view?.groupBy}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onRowClick={(r) => drawer.open(def.key, r.id, { root: true })}
        activeId={drawer.current?.object === def.key ? drawer.current.id : undefined}
        label={def.plural}
      />
      {selection.length > 0 ? <BulkBar def={def} ids={selection} rows={(list.data ?? []).filter((r) => selection.includes(r.id))} onDone={() => setSelection([])} /> : null}
    </div>
  );
}
