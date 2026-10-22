'use client';

import * as React from 'react';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Skeleton } from '../../ui/skeleton';
import { Icon } from '../components/icons';
import { UserAvatar } from '../components/user-avatar';
import type { Ref } from '../engine/contracts';
import { newLabel } from '../engine/registry';
import { useAppMessages, useDataSource, useRegistry } from '../engine/provider';
import type { Filter, ObjectKey } from '../engine/types';
import { useAsync, useDebounced } from '../engine/use-async';

export type Picked = Ref;

/** Cible spéciale : les membres de l'organisation (champs `user` et `users`). */
export const MEMBER = 'member';

/**
 * Sélecteur de relation : recherche, choix simple ou multiple, création à la volée si l'application
 * fournit `onCreate`. Les membres viennent de la source de données (`members`), les autres objets de `pick`.
 */
export function RelationPicker({
  target,
  multiple,
  value,
  onChange,
  filters,
  placeholder,
  onCreate,
  autoFocus = true,
}: {
  target: ObjectKey | typeof MEMBER;
  multiple?: boolean;
  value: Picked[];
  onChange: (next: Picked[], closing?: boolean) => void;
  filters?: Filter[];
  placeholder?: string;
  /** Crée un enregistrement du texte saisi et renvoie la relation à ajouter. */
  onCreate?: (search: string) => Promise<Picked | null> | Picked | null;
  autoFocus?: boolean;
}) {
  const m = useAppMessages();
  const ds = useDataSource();
  const registry = useRegistry();
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search);
  const isMember = target === MEMBER;
  const def = !isMember && registry.has(target) ? registry.get(target) : undefined;

  const members = useAsync(() => (ds.members ? ds.members() : Promise.resolve([])), [ds], isMember);
  const picks = useAsync(() => ds.pick(target, q, filters), [ds, target, q, JSON.stringify(filters)], !isMember);

  const items: Picked[] = React.useMemo(() => {
    if (isMember) {
      const all = (members.data ?? []).map((x) => ({ id: x.id, label: x.label, sub: x.email }));
      const n = search.trim().toLowerCase();
      return n ? all.filter((x) => x.label.toLowerCase().includes(n)) : all;
    }
    return picks.data ?? [];
  }, [isMember, members.data, picks.data, search]);

  const selected = new Set(value.map((v) => v.id));
  const toggle = (item: Picked) => {
    if (multiple) onChange(selected.has(item.id) ? value.filter((v) => v.id !== item.id) : [...value, item]);
    else onChange(selected.has(item.id) ? [] : [item], true);
  };
  const loading = isMember ? members.loading : picks.loading;
  const term = search.trim();
  const label = placeholder ?? (isMember ? m.field.search : def ? `${m.field.search.replace('…', '')} ${def.singular}…` : m.field.search);

  return (
    <Command shouldFilter={false} loop className="w-full">
      <CommandInput autoFocus={autoFocus} value={search} onValueChange={setSearch} placeholder={label} />
      <CommandList className="max-h-72">
        {loading && items.length === 0 ? (
          <div className="flex flex-col gap-1 p-2" role="status" aria-label={m.field.searching}>
            <Skeleton className="h-control-sm w-full" />
            <Skeleton className="h-control-sm w-full" />
          </div>
        ) : (
          <CommandEmpty>{m.field.noResult}</CommandEmpty>
        )}
        {items.length > 0 ? (
          <CommandGroup>
            {items.map((item) => (
              <CommandItem key={item.id} value={item.id} onSelect={() => toggle(item)} className="gap-2">
                {isMember ? <UserAvatar name={item.label} /> : <Icon name={def?.icon} className="size-4 text-muted-foreground" />}
                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                  {item.sub ? <span className="type-caption ml-2 text-muted-foreground">{item.sub}</span> : null}
                </span>
                <CheckIcon className={cn('size-4', selected.has(item.id) ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {onCreate && def ? (
          <CommandGroup>
            <CommandItem
              value="__create__"
              className="gap-2 text-muted-foreground"
              onSelect={async () => {
                const made = await onCreate(term);
                if (made) onChange(multiple ? [...value, made] : [made], !multiple);
              }}
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              {term ? `${newLabel(def)} « ${term} »` : newLabel(def)}
            </CommandItem>
          </CommandGroup>
        ) : null}
      </CommandList>
    </Command>
  );
}
