'use client';

import * as React from 'react';
import { ArrowLeftIcon, Maximize2Icon, Minimize2Icon, XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../../ui/sheet';
import { Skeleton } from '../../ui/skeleton';
import { DataTable } from '../components/data-table';
import { Icon } from '../components/icons';
import { ErrorState } from '../components/states';
import type { Row } from '../engine/query';
import { getField } from '../engine/registry';
import { useAppMessages, useDataSource, useRegistry, useSlots } from '../engine/provider';
import type { FieldDef, Filter, ObjectDef, RelatedSection } from '../engine/types';
import { useAsync } from '../engine/use-async';
import { EditableField } from '../fields/editable-field';
import { useDrawer, type DrawerEntry } from './use-drawer';

/** Remplace le repère `$id` des filtres d'une section liée par l'identifiant de la fiche. */
export function resolveSectionFilters(filters: Filter[], id: string): Filter[] {
  return filters.map((f) => (f.value === '$id' ? { ...f, value: id } : f));
}

function FieldRow({ def, field, rec }: { def: ObjectDef; field: FieldDef; rec: Row }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-3 py-1">
      <dt className="type-body-sm min-h-control-sm flex items-center text-muted-foreground">{field.label}</dt>
      <dd className="type-body-sm min-w-0">
        <EditableField object={def.key} id={rec.id} field={field} value={rec[field.key]} row={rec} variant="detail" />
      </dd>
    </div>
  );
}

function RelatedBlock({ section, rec }: { section: RelatedSection; rec: Row }) {
  const ds = useDataSource();
  const registry = useRegistry();
  const drawer = useDrawer();
  const target = registry.get(section.object);
  const filters = React.useMemo(() => resolveSectionFilters(section.filters, rec.id), [section, rec.id]);
  const list = useAsync(() => ds.list({ object: section.object, filters, sort: section.sort }), [ds, section.object, JSON.stringify(filters)]);
  return (
    <DataTable
      def={target}
      columns={section.columns}
      rows={list.data}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      compact
      editable={false}
      empty={{ title: section.empty }}
      onRowClick={(r) => drawer.open(section.object, r.id)}
      label={section.title}
    />
  );
}

function DrawerBody({ entry }: { entry: DrawerEntry }) {
  const m = useAppMessages();
  const ds = useDataSource();
  const registry = useRegistry();
  const slots = useSlots();
  const drawer = useDrawer();
  const def = registry.get(entry.object);
  const recState = useAsync(() => ds.get(entry.object, entry.id), [ds, entry.object, entry.id]);
  const rec = { ...recState, data: recState.data as Row | undefined };
  const data = rec.data;
  const title = data ? String(data[def.titleKey] ?? '') : '';
  const headerFields = def.drawer.header.map((k) => getField(def, k)).filter((f): f is FieldDef => !!f);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-2 border-b border-divider px-5 pt-4 pb-3">
        {drawer.stack.length > 1 ? (
          <Button variant="ghost" size="icon-sm" onClick={drawer.back} aria-label={m.drawer.back}>
            <ArrowLeftIcon />
          </Button>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name={def.icon} className="size-5 shrink-0 text-muted-foreground" />
            {rec.data ? (
              <SheetTitle className="type-title min-w-0 truncate text-heading" data-title>
                {title || m.drawer.noTitle}
              </SheetTitle>
            ) : (
              <>
                <SheetTitle className="sr-only">{def.singular}</SheetTitle>
                <Skeleton className="h-6 w-56" />
              </>
            )}
          </div>
          {rec.data ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {headerFields.map((f) => (
                <EditableField key={f.key} object={def.key} id={rec.data!.id} field={f} value={rec.data![f.key]} row={rec.data} variant="header" />
              ))}
              {slots.headerExtras?.({ def, rec: rec.data })}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => drawer.setMode(drawer.full ? 'panel' : 'full')} aria-label={drawer.full ? m.drawer.panel : m.drawer.fullScreen}>
            {drawer.full ? <Minimize2Icon /> : <Maximize2Icon />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={drawer.close} aria-label={m.drawer.close}>
            <XIcon />
          </Button>
        </div>
      </div>
      <SheetDescription className="sr-only">{m.drawer.label}</SheetDescription>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {rec.error ? (
          <ErrorState message={rec.error.message} onRetry={rec.reload} />
        ) : !data ? (
          <div className="flex flex-col gap-3" role="status" aria-label={m.states.loading}>
            <Skeleton className="h-control-md w-full" />
            <Skeleton className="h-control-md w-full" />
            <Skeleton className="h-control-md w-3/4" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {def.drawer.sections.map((s, i) => (
              <section key={`${s.kind}-${i}`} aria-label={s.title} className="flex flex-col gap-2">
                <h2 className="type-heading text-heading">{s.title}</h2>
                {s.kind === 'fields' ? (
                  <dl>
                    {s.fields.map((k) => {
                      const f = getField(def, k);
                      return f ? <FieldRow key={k} def={def} field={f} rec={rec.data!} /> : null;
                    })}
                  </dl>
                ) : s.kind === 'related' ? (
                  <RelatedBlock section={s} rec={data} />
                ) : (
                  slots.drawerSections?.[s.key]?.({ def, rec: data }) ?? null
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fiche latérale de l'enregistrement au sommet de la pile (`useDrawer`) : en-tête (titre et champs
 * clés modifiables), sections de champs, listes liées, sections de l'application. Panneau à droite
 * (volet), ou plein écran. Se ferme avec Échap ; `Retour` dépile.
 */
export function RecordDrawerHost({ className }: { className?: string }) {
  const m = useAppMessages();
  const drawer = useDrawer();
  const current = drawer.current;
  return (
    <Sheet open={!!current} onOpenChange={(o) => !o && drawer.close()}>
      {current ? (
        <SheetContent size={drawer.full ? 'wide' : 'wide'} aria-label={m.drawer.label} showCloseButton={false} className={cn('p-0', drawer.full && 'sm:data-[size=wide]:w-full', className)} data-mode={drawer.mode}>
          <DrawerBody key={`${current.object}.${current.id}`} entry={current} />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
