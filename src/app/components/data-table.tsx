'use client';

import * as React from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon, InboxIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Checkbox } from '../../ui/checkbox';
import { useAppMessages, useFormatters } from '../engine/provider';
import { groupRows, isSortable, nextSort, type Row } from '../engine/query';
import { getField } from '../engine/registry';
import type { FieldDef, ObjectDef, Sort } from '../engine/types';
import { EditableField } from '../fields/editable-field';
import { FieldDisplay } from '../fields/field-display';
import { Icon } from './icons';
import { Pill } from './pill';
import { EmptyState, ErrorState, LoadingRows } from './states';

/** Colonne explicite, sans objet de métadonnées : le tableau sert aussi à des données quelconques. */
export interface ColumnSpec<T extends Row = Row> {
  key: string;
  header: string;
  /** Poids relatif de la colonne dans la largeur du tableau (comme `FieldDef.width`). */
  width?: number;
  align?: 'start' | 'end';
  sortable?: boolean;
  cell: (row: T) => React.ReactNode;
}

interface BaseProps {
  rows: Row[] | undefined;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  sort?: Sort[];
  onSortChange?: (s: Sort[]) => void;
  onRowClick?: (row: Row) => void;
  /** Action rapide en bout de ligne (visible au survol et au focus). */
  rowAction?: (row: Row) => React.ReactNode;
  selectable?: boolean;
  /** Sélection contrôlée ; sinon gardée par le tableau. */
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  compact?: boolean;
  empty?: { title?: string; description?: string; action?: React.ReactNode };
  /** Ligne mise en avant (fiche ouverte). */
  activeId?: string;
  className?: string;
  /** Nom du tableau pour les lecteurs d'écran. */
  label?: string;
}

export interface DataTableProps extends BaseProps {
  /** Pilotage par métadonnées. */
  def?: ObjectDef;
  /** Clés des colonnes (défaut : `def.columns`). */
  columns?: string[] | ColumnSpec[];
  groupBy?: string | null;
  groupLabels?: Record<string, string>;
  /** Cellules modifiables sur place (défaut : vrai avec `def`). */
  editable?: boolean;
  /** Création à la volée d'un enregistrement lié, depuis un sélecteur de cellule. */
  onCreateRelated?: (target: string, search: string) => Promise<{ id: string; label: string } | null> | { id: string; label: string } | null;
}

interface Col {
  id: string;
  header: string;
  weight: number;
  align: 'start' | 'end';
  sortable: boolean;
  field?: FieldDef;
  render: (row: Row) => React.ReactNode;
}

const END_TYPES = new Set(['number', 'currency', 'percent']);

/** Rend le fil des colonnes : lignes, en-têtes triables, groupes repliables, sélection, états vide/chargement/erreur. */
export function DataTable(props: DataTableProps) {
  const { def, rows, loading, error, onRetry, sort, onSortChange, groupBy, groupLabels, onRowClick, rowAction, selectable, compact, empty, activeId, className, label, editable = !!def, onCreateRelated } = props;
  const m = useAppMessages();
  const f = useFormatters();
  const [innerSel, setInnerSel] = React.useState<string[]>([]);
  const sel = props.selection ?? innerSel;
  const setSel = (ids: string[]) => {
    if (props.selection === undefined) setInnerSel(ids);
    props.onSelectionChange?.(ids);
  };
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const selectedSet = new Set(sel);

  const cols = React.useMemo<Col[]>(() => {
    const spec = props.columns;
    if (spec && typeof spec[0] === 'object') {
      return (spec as ColumnSpec[]).map((c) => ({
        id: c.key,
        header: c.header,
        weight: c.width ?? 40,
        align: c.align ?? 'start',
        sortable: !!c.sortable,
        render: (r) => c.cell(r),
      }));
    }
    if (!def) return [];
    const keys = (spec as string[] | undefined) ?? def.columns;
    const out: Col[] = [];
    for (const key of keys) {
      const field = getField(def, key);
      if (!field) continue;
      const isTitle = key === def.titleKey && !def.plainTitle;
      out.push({
        id: key,
        header: field.label,
        weight: field.width ?? 40,
        align: field.align ?? (END_TYPES.has(field.type) ? 'end' : 'start'),
        sortable: isSortable(field),
        field,
        render: (r) => {
          if (isTitle && field.type !== 'task') {
            return (
              <span className="flex min-w-0 items-center gap-2 text-heading">
                <Icon name={def.icon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate" data-title>
                  {String(r[key] ?? '') || <span className="text-muted-foreground">{m.table.untitled}</span>}
                </span>
              </span>
            );
          }
          if (editable && !field.readOnly) {
            return <EditableField object={def.key} id={r.id} field={field} value={r[key]} row={r} onCreateRelated={onCreateRelated} className={field.align === 'end' || END_TYPES.has(field.type) ? 'justify-end text-right' : undefined} />;
          }
          return (
            <div className={cn('flex min-w-0 items-center', (field.align === 'end' || END_TYPES.has(field.type)) && 'justify-end text-right')}>
              <FieldDisplay field={field} value={r[key]} row={r} />
            </div>
          );
        },
      });
    }
    return out;
  }, [props.columns, def, editable, m.table.untitled, onCreateRelated]);

  const groups = React.useMemo(() => {
    if (!groupBy || !def || !rows) return null;
    return groupRows(def, rows, groupBy, { emptyLabel: m.table.groupNone });
  }, [groupBy, def, rows, m.table.groupNone]);

  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (loading && !rows) return <LoadingRows rows={compact ? 3 : 10} />;
  if (rows && rows.length === 0) {
    return <EmptyState icon={InboxIcon} compact={compact} title={empty?.title ?? m.table.emptyResults} description={empty?.description} action={empty?.action} />;
  }

  const list = rows ?? [];
  const allSelected = list.length > 0 && list.every((r) => selectedSet.has(r.id));
  const someSelected = !allSelected && list.some((r) => selectedSet.has(r.id));
  const extra = (selectable ? 1 : 0) + (rowAction ? 1 : 0);
  const totalWeight = cols.reduce((s, c) => s + c.weight, 0) || 1;
  // Les colonnes d'accompagnement (case, action) ont une largeur fixe prise sur celle du tableau.
  const pct = (w: number) => `${(w / totalWeight) * 100}%`;

  const toggleSort = (c: Col) => {
    if (!onSortChange || !c.sortable) return;
    onSortChange(nextSort(sort?.[0], c.id));
  };

  const cellPad = 'px-3';
  const renderRow = (r: Row) => {
    const on = selectedSet.has(r.id);
    return (
      <tr
        key={r.id}
        data-row-id={r.id}
        data-state={on ? 'selected' : undefined}
        onClick={() => onRowClick?.(r)}
        className={cn(
          'group/row border-b border-divider transition-colors duration-micro last:border-b-0',
          onRowClick && 'cursor-pointer',
          on ? 'bg-accent' : 'hover:bg-muted',
          activeId === r.id && !on && 'bg-muted',
        )}
      >
        {selectable ? (
          <td className={cn('w-10 pr-0 pl-3 align-middle', compact ? 'h-row-single' : 'h-row-single')}>
            <Checkbox
              aria-label={m.table.selectRow}
              checked={on}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(v) => setSel(v === true ? [...sel, r.id] : sel.filter((x) => x !== r.id))}
            />
          </td>
        ) : null}
        {cols.map((c) => (
          <td key={c.id} className={cn('h-row-single overflow-hidden align-middle', cellPad, c.align === 'end' && 'text-right')}>
            {c.render(r)}
          </td>
        ))}
        {rowAction ? (
          <td className="w-12 px-2 text-right align-middle" onClick={(e) => e.stopPropagation()}>
            <span className="inline-flex opacity-0 transition-opacity duration-micro group-hover/row:opacity-100 group-focus-within/row:opacity-100">{rowAction(r)}</span>
          </td>
        ) : null}
      </tr>
    );
  };

  return (
    <div data-slot="data-table" className={cn('relative min-w-0', className)}>
      <table aria-label={label} className="type-body-sm w-full table-fixed border-separate border-spacing-0 text-foreground">
        <colgroup>
          {selectable ? <col className="w-10" /> : null}
          {cols.map((c) => (
            <col key={c.id} style={{ width: pct(c.weight) }} />
          ))}
          {rowAction ? <col className="w-12" /> : null}
        </colgroup>
        <thead>
          <tr>
            {selectable ? (
              <th scope="col" className="h-row-single w-10 border-b border-border bg-muted pr-0 pl-3 text-left align-middle">
                <Checkbox
                  aria-label={m.table.selectAll}
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(v) => setSel(v === true ? list.map((r) => r.id) : [])}
                />
              </th>
            ) : null}
            {cols.map((c) => {
              const dir = sort?.[0]?.key === c.id ? sort[0]?.dir : undefined;
              const sortable = !!onSortChange && c.sortable;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
                  className={cn('type-label h-row-single border-b border-border bg-muted align-middle whitespace-nowrap text-muted-foreground', cellPad, c.align === 'end' ? 'text-right' : 'text-left')}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
                      className={cn('focus-ring -mx-1 inline-flex max-w-full items-center gap-1 rounded-detail px-1 hover:text-foreground', c.align === 'end' && 'flex-row-reverse')}
                    >
                      <span className="truncate">{c.header}</span>
                      {dir === 'asc' ? <ArrowUpIcon className="size-3 shrink-0" aria-hidden="true" /> : null}
                      {dir === 'desc' ? <ArrowDownIcon className="size-3 shrink-0" aria-hidden="true" /> : null}
                    </button>
                  ) : (
                    <span className="block truncate">{c.header}</span>
                  )}
                </th>
              );
            })}
            {rowAction ? <th scope="col" className="h-row-single w-12 border-b border-border bg-muted" aria-hidden="true" /> : null}
          </tr>
        </thead>
        <tbody>
          {groups
            ? groups.map((g) => {
                const opt = def ? getField(def, groupBy!)?.options?.find((o) => o.value === g.key) : undefined;
                return (
                  <React.Fragment key={g.key}>
                    <tr>
                      <td colSpan={cols.length + extra} className="border-b border-divider bg-muted px-3 py-0">
                        <button
                          type="button"
                          onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                          className="focus-ring type-label flex h-control-md w-full items-center gap-2 rounded-detail text-left"
                          aria-expanded={!collapsed[g.key]}
                        >
                          <ChevronRightIcon className={cn('size-4 text-muted-foreground transition-transform duration-fast', !collapsed[g.key] && 'rotate-90')} aria-hidden="true" />
                          {opt?.color ? <Pill color={opt.color}>{groupLabels?.[g.key] ?? g.label}</Pill> : <span>{groupLabels?.[g.key] ?? g.label}</span>}
                          <span className="text-muted-foreground tabular-nums">{f.number(g.rows.length)}</span>
                        </button>
                      </td>
                    </tr>
                    {!collapsed[g.key] ? g.rows.map(renderRow) : null}
                  </React.Fragment>
                );
              })
            : list.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
