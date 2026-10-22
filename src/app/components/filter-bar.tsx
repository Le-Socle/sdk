'use client';

import * as React from 'react';
import { CheckIcon, ListFilterIcon, PlusIcon, XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Input } from '../../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { defaultOp, filterableFields } from '../engine/query';
import { getField } from '../engine/registry';
import { useAppMessages, useFieldOptions, useFormatters } from '../engine/provider';
import type { FieldDef, Filter, FilterOp, ObjectDef } from '../engine/types';
import { MEMBER, RelationPicker, type Picked } from '../fields/relation-picker';
import { TagPicker, useTags } from '../fields/tag-picker';
import type { Tag } from '../engine/contracts';
import { Pill } from './pill';

/** Valeur spéciale d'un filtre « Moi » sur un utilisateur ; l'application la remplace par l'identifiant courant. */
export const ME = '__me__';

function useOpLabel() {
  const m = useAppMessages().filter;
  const labels: Partial<Record<FilterOp, string>> = {
    contains: m.contains,
    in: m.is,
    has: m.includes,
    gte: m.gte,
    lte: m.lte,
    gt: '>',
    lt: '<',
    eq: '=',
    before: m.before,
    after: m.after,
    isTrue: m.yes,
    isFalse: m.no,
    empty: m.empty,
    notEmpty: m.notEmpty,
  };
  return labels;
}

/** Libellé lisible d'un filtre (texte de la puce). */
function useFilterSummary(def: ObjectDef, filter: Filter) {
  const m = useAppMessages().filter;
  const f = useFormatters();
  const ops = useOpLabel();
  const field = getField(def, filter.field);
  const options = useFieldOptions(field ?? { options: undefined, optionsSource: undefined });
  const tags = useTags();
  if (!field) return { label: filter.field, value: '' };
  let value = '';
  if (filter.op === 'isTrue') value = m.yes;
  else if (filter.op === 'isFalse') value = m.no;
  else if (filter.op === 'empty' || filter.op === 'notEmpty') value = ops[filter.op] ?? '';
  else if (Array.isArray(filter.value) || field.type === 'select') {
    const vals = Array.isArray(filter.value) ? filter.value : [filter.value];
    value = vals
      .map((v) => {
        if (v === ME) return m.me;
        const o = options?.find((x) => x.value === String(v));
        if (o) return o.label;
        const t = field.type === 'tags' ? tags.data?.find((x) => x.id === v) : undefined;
        if (t) return t.label;
        return filter.labels?.[String(v)] ?? '…';
      })
      .join(', ');
  } else if (field.type === 'date' || field.type === 'datetime') value = `${ops[filter.op] ?? ''} ${f.date(filter.value, { full: true })}`;
  else if (field.type === 'number' || field.type === 'currency' || field.type === 'percent') value = `${ops[filter.op] ?? ''} ${String(filter.value ?? '')}`;
  else if (filter.op === 'has') value = filter.labels?.[String(filter.value)] ?? '…';
  else value = `« ${String(filter.value ?? '')} »`;
  return { label: field.label, value };
}

function FilterChip({ def, filter, onChange, onRemove }: { def: ObjectDef; filter: Filter; onChange: (f: Filter) => void; onRemove: () => void }) {
  const m = useAppMessages().filter;
  const [open, setOpen] = React.useState(false);
  const s = useFilterSummary(def, filter);
  const field = getField(def, filter.field);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div data-slot="filter-chip" className="type-body-sm inline-flex h-control-sm items-center rounded-md border border-border bg-background">
        <PopoverTrigger asChild>
          <button type="button" className="focus-ring-inset flex h-full max-w-72 items-center gap-1 truncate rounded-l-md pr-1 pl-3 hover:bg-muted">
            <span className="text-muted-foreground">{s.label} :</span>
            <span className="truncate text-foreground">{s.value}</span>
          </button>
        </PopoverTrigger>
        <button
          type="button"
          aria-label={m.remove.replace('{label}', s.label)}
          onClick={onRemove}
          className="focus-ring-inset flex h-full items-center rounded-r-md px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <PopoverContent align="start" className="w-72 p-0">
        {field ? (
          <FilterEditor
            field={field}
            filter={filter}
            onApply={(f) => {
              onChange(f);
              setOpen(false);
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function TagFilter({ initial, onApply }: { initial: string[]; onApply: (ids: string[]) => void }) {
  const all = useTags();
  const [value, setValue] = React.useState<Tag[] | null>(null);
  const seeded = value ?? (all.data ?? []).filter((t) => initial.includes(t.id));
  return <TagPicker value={seeded} onChange={setValue} allowCreate={false} onDone={(tags) => tags.length && onApply(tags.map((t) => t.id))} />;
}

function FilterEditor({ field, filter, onApply }: { field: FieldDef; filter?: Filter; onApply: (f: Filter) => void }) {
  const m = useAppMessages();
  const ops = useOpLabel();
  const options = useFieldOptions(field) ?? [];
  const op0 = filter?.op ?? defaultOp(field);
  const [op, setOp] = React.useState<FilterOp>(op0);
  const [text, setText] = React.useState(filter && !Array.isArray(filter.value) ? String(filter.value ?? '') : '');
  const [selected, setSelected] = React.useState<string[]>(Array.isArray(filter?.value) ? (filter.value as string[]) : []);
  const [picked, setPicked] = React.useState<Picked[]>([]);
  const fieldKey = field.type === 'relation' || field.type === 'user' ? (field.idKey ?? field.key) : field.key;

  if (field.type === 'tags') return <TagFilter initial={selected} onApply={(ids) => onApply({ field: field.key, op: 'has', value: ids })} />;

  if (field.type === 'boolean') {
    return (
      <div className="flex flex-col p-1">
        {(['isTrue', 'isFalse'] as const).map((o) => (
          <button key={o} type="button" onClick={() => onApply({ field: field.key, op: o })} className="focus-ring-inset type-body-sm flex h-control-md items-center justify-between rounded-md px-2 hover:bg-muted">
            {field.label} : {o === 'isTrue' ? m.filter.yes : m.filter.no}
            {filter?.op === o ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'select' || field.type === 'multiselect') {
    return (
      <div className="flex flex-col">
        <Command>
          {options.length > 7 ? <CommandInput placeholder={m.filter.searchValue} autoFocus /> : null}
          <CommandList className="max-h-64">
            <CommandEmpty>{m.filter.noValue}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => setSelected(on ? selected.filter((x) => x !== o.value) : [...selected, o.value])} className="justify-between">
                    <Pill color={o.color} icon={o.icon}>
                      {o.label}
                    </Pill>
                    <CheckIcon className={cn('size-4', on ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="flex justify-end border-t border-divider p-2">
          <Button size="sm" disabled={!selected.length} onClick={() => onApply({ field: field.key, op: 'in', value: selected })}>
            {m.filter.apply}
          </Button>
        </div>
      </div>
    );
  }

  if (field.type === 'relation' || field.type === 'user' || field.type === 'relations' || field.type === 'users') {
    const isUser = field.type === 'user' || field.type === 'users';
    const multiOp = field.type === 'relations' || field.type === 'users' ? 'has' : 'in';
    return (
      <div className="flex flex-col">
        {isUser ? (
          <button type="button" onClick={() => onApply({ field: fieldKey, op: 'in', value: [ME] })} className="focus-ring-inset type-body-sm m-1 flex h-control-md items-center rounded-md px-2 text-left hover:bg-muted">
            {m.filter.me}
          </button>
        ) : null}
        <RelationPicker target={isUser ? MEMBER : (field.target as string)} multiple value={picked} onChange={(next) => setPicked(next)} />
        <div className="flex justify-end border-t border-divider p-2">
          <Button
            size="sm"
            disabled={!picked.length}
            onClick={() =>
              onApply({
                field: multiOp === 'has' ? field.key : fieldKey,
                op: multiOp,
                value: picked.map((p) => p.id),
                labels: Object.fromEntries(picked.map((p) => [p.id, p.label])),
              })
            }
          >
            {m.filter.apply}
          </Button>
        </div>
      </div>
    );
  }

  const numeric = field.type === 'number' || field.type === 'currency' || field.type === 'percent';
  const dated = field.type === 'date' || field.type === 'datetime';
  const choices: FilterOp[] = numeric ? ['gte', 'lte'] : dated ? ['after', 'before'] : ['contains'];
  return (
    <form
      className="flex flex-col gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onApply({ field: field.key, op, value: numeric ? Number(text) : text.trim() });
      }}
    >
      <p className="type-label text-muted-foreground">{field.label}</p>
      {choices.length > 1 ? (
        <div className="flex rounded-md border border-border p-0.5" role="radiogroup" aria-label={field.label}>
          {choices.map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={op === o}
              onClick={() => setOp(o)}
              className={cn('focus-ring type-label-sm h-control-sm flex-1 rounded-detail', op === o ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {ops[o]}
            </button>
          ))}
        </div>
      ) : null}
      <Input
        autoFocus
        type={numeric ? 'number' : dated ? 'date' : 'text'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={numeric ? m.filter.value : dated ? undefined : m.filter.textSearched}
        aria-label={m.filter.valueOf.replace('{label}', field.label)}
        className={cn(numeric && 'tabular-nums')}
      />
      <Button size="sm" type="submit" disabled={!text.trim()}>
        {m.filter.apply}
      </Button>
    </form>
  );
}

/** Barre de filtres : une puce par filtre actif (modifiable, retirable) et l'ajout d'un filtre par champ. */
export function FilterBar({ def, filters, onChange, className }: { def: ObjectDef; filters: Filter[]; onChange: (f: Filter[]) => void; className?: string }) {
  const m = useAppMessages().filter;
  const [open, setOpen] = React.useState(false);
  const [field, setField] = React.useState<FieldDef | null>(null);
  const fields = filterableFields(def);
  return (
    <div data-slot="filter-bar" className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((f, i) => (
        <FilterChip
          key={`${f.field}-${i}`}
          def={def}
          filter={f}
          onChange={(nf) => onChange(filters.map((x, j) => (j === i ? nf : x)))}
          onRemove={() => onChange(filters.filter((_, j) => j !== i))}
        />
      ))}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setField(null);
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {filters.length ? <PlusIcon /> : <ListFilterIcon />} {filters.length ? m.addMore : m.add}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          {field ? (
            <FilterEditor
              field={field}
              onApply={(f) => {
                onChange([...filters, f]);
                setOpen(false);
                setField(null);
              }}
            />
          ) : (
            <Command>
              <CommandInput placeholder={m.by} autoFocus />
              <CommandList className="max-h-72">
                <CommandEmpty>{m.noField}</CommandEmpty>
                <CommandGroup>
                  {fields.map((f) => (
                    <CommandItem key={f.key} value={f.label} onSelect={() => setField(f)}>
                      {f.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
      {filters.length ? (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange([])}>
          {m.reset}
        </Button>
      ) : null}
    </div>
  );
}
