'use client';

import * as React from 'react';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Skeleton } from '../../ui/skeleton';
import { Dot } from '../components/pill';
import type { Tag } from '../engine/contracts';
import { useAppMessages, useDataSource, useInvalidate, useNotifier } from '../engine/provider';
import { useAsync } from '../engine/use-async';

/** Étiquettes de l'organisation (source de données `tags`). */
export function useTags() {
  const ds = useDataSource();
  return useAsync(() => (ds.tags ? ds.tags.list() : Promise.resolve([] as Tag[])), [ds]);
}

/** Choix multiple d'étiquettes, avec création à la volée quand la source le permet. */
export function TagPicker({
  value,
  onChange,
  onDone,
  autoFocus = true,
  allowCreate = true,
}: {
  value: Tag[];
  onChange: (next: Tag[]) => void;
  onDone?: (next: Tag[]) => void;
  autoFocus?: boolean;
  allowCreate?: boolean;
}) {
  const m = useAppMessages();
  const ds = useDataSource();
  const notifier = useNotifier();
  const invalidate = useInvalidate();
  const tags = useTags();
  const [search, setSearch] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const selected = new Set(value.map((t) => t.id));
  const term = search.trim();
  const all = tags.data ?? [];
  const items = term ? all.filter((t) => t.label.toLowerCase().includes(term.toLowerCase())) : all;
  const exact = all.some((t) => t.label.toLowerCase() === term.toLowerCase());
  const canCreate = allowCreate && !!ds.tags;

  const toggle = (t: Tag) => onChange(selected.has(t.id) ? value.filter((v) => v.id !== t.id) : [...value, t]);
  const create = async () => {
    if (!ds.tags) return;
    setCreating(true);
    try {
      const tag = await ds.tags.create(term, 'gray');
      invalidate();
      setSearch('');
      if (!selected.has(tag.id)) onChange([...value, tag]);
    } catch (e) {
      notifier.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Command shouldFilter={false} loop className="w-full">
        <CommandInput autoFocus={autoFocus} value={search} onValueChange={setSearch} placeholder={m.field.tagSearch} />
        <CommandList className="max-h-64">
          {tags.loading && !tags.data ? (
            <div className="flex flex-col gap-1 p-2" role="status" aria-label={m.field.searching}>
              <Skeleton className="h-control-sm w-full" />
              <Skeleton className="h-control-sm w-full" />
            </div>
          ) : !(canCreate && term) ? (
            <CommandEmpty>{m.field.noTag}</CommandEmpty>
          ) : null}
          {items.length > 0 ? (
            <CommandGroup>
              {items.map((t) => (
                <CommandItem key={t.id} value={t.id} onSelect={() => toggle(t)} className="gap-2">
                  <Dot color={String(t.color)} />
                  <span className="min-w-0 flex-1 truncate">{t.label}</span>
                  <CheckIcon className={cn('size-4', selected.has(t.id) ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {canCreate && term && !exact ? (
            <CommandGroup>
              <CommandItem value="__create__" onSelect={create} disabled={creating} className="gap-2 text-muted-foreground">
                <PlusIcon className="size-4" aria-hidden="true" />
                {m.field.createTag.replace('{label}', term)}
              </CommandItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
      {onDone ? (
        <div className="flex items-center justify-between gap-2 border-t border-divider p-2">
          <span className="type-caption text-muted-foreground tabular-nums">{m.field.selectedCount.replace('{n}', String(value.length))}</span>
          <Button size="sm" onClick={() => onDone(value)}>
            {m.field.validate}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
