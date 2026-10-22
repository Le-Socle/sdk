'use client';

import * as React from 'react';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';
import { Pill } from '../components/pill';
import type { Ref, Tag } from '../engine/contracts';
import { useAppMessages, useFieldOptions, useFormatters } from '../engine/provider';
import type { FieldDef } from '../engine/types';
import { MEMBER, RelationPicker, type Picked } from './relation-picker';
import { TagPicker } from './tag-picker';

function toPicked(v: unknown): Picked[] {
  if (!v) return [];
  if (Array.isArray(v)) return v as Picked[];
  return [v as Picked];
}

export interface FieldEditorProps {
  field: FieldDef;
  value: unknown;
  /** Reçoit la valeur à envoyer à la source (identifiants pour les relations) et la valeur affichable. */
  onSave: (value: unknown, display?: unknown) => void;
  onCancel?: () => void;
  /** `popover` : dans une fenêtre flottante (marges internes). `inline` : posé directement dans la page. */
  mode?: 'popover' | 'inline';
  /** Création à la volée d'un enregistrement lié (fournie par l'application). */
  onCreateRelated?: (target: string, search: string) => Promise<Picked | null> | Picked | null;
}

/**
 * Éditeur d'un champ selon son type. Utilisé dans les cellules du tableau, la fiche et les actions
 * groupées. Un champ texte, nombre ou date s'édite dans le même gabarit que la valeur au repos :
 * hauteur d'un contrôle (`--control-md`), jamais plus haut que la ligne qui le porte.
 */
export function FieldEditor({ field, value, onSave, onCancel, mode = 'popover', onCreateRelated }: FieldEditorProps) {
  const m = useAppMessages();
  const options = useFieldOptions(field) ?? [];

  switch (field.type) {
    case 'select':
    case 'multiselect': {
      const multi = field.type === 'multiselect';
      const current = multi ? ((value as string[]) ?? []) : value ? [String(value)] : [];
      return (
        <Command className="w-full">
          {options.length > 6 ? <CommandInput autoFocus placeholder={m.field.filterOptions} /> : null}
          <CommandList className="max-h-72">
            <CommandEmpty>{m.field.noValue}</CommandEmpty>
            <CommandGroup>
              {options
                .filter((o) => o.manualOnly !== false || current.includes(o.value))
                .map((o) => {
                  const on = current.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() => (multi ? onSave(on ? current.filter((x) => x !== o.value) : [...current, o.value]) : onSave(o.value))}
                      className="justify-between"
                    >
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
      );
    }
    case 'tags':
      return <TagEditor initial={(value as Tag[]) ?? []} onSave={(tags) => onSave(tags.map((t) => t.id), tags)} />;
    case 'relation':
    case 'user':
    case 'relations':
    case 'users': {
      const multi = field.type === 'relations' || field.type === 'users';
      const target = field.type === 'user' || field.type === 'users' ? MEMBER : (field.target as string);
      return (
        <PickerEditor
          field={field}
          target={target}
          initial={toPicked(value)}
          multi={multi}
          onCreate={onCreateRelated && target !== MEMBER ? (s) => onCreateRelated(target, s) : undefined}
          onSave={(picked) => onSave(multi ? picked.map((p) => p.id) : (picked[0]?.id ?? null), multi ? picked : (picked[0] ?? null))}
        />
      );
    }
    case 'boolean':
      return (
        <label className="type-body-sm flex items-center gap-2 p-3">
          <Switch checked={Boolean(value)} onCheckedChange={(v) => onSave(v)} autoFocus />
          {field.label}
        </label>
      );
    case 'emails':
    case 'phones':
    case 'textlist':
      return <ListEditor field={field} initial={(value as string[]) ?? []} onSave={onSave} onCancel={onCancel} />;
    default:
      return <ScalarEditor field={field} value={value} onSave={onSave} onCancel={onCancel} mode={mode} />;
  }
}

function TagEditor({ initial, onSave }: { initial: Tag[]; onSave: (t: Tag[]) => void }) {
  const [tags, setTags] = React.useState<Tag[]>(initial);
  return <TagPicker value={tags} onChange={setTags} onDone={onSave} />;
}

function PickerEditor({
  field,
  target,
  initial,
  multi,
  onSave,
  onCreate,
}: {
  field: FieldDef;
  target: string;
  initial: Picked[];
  multi: boolean;
  onSave: (p: Picked[]) => void;
  onCreate?: (search: string) => Promise<Picked | null> | Picked | null;
}) {
  const m = useAppMessages();
  const [picked, setPicked] = React.useState<Picked[]>(initial);
  return (
    <div className="flex flex-col">
      <RelationPicker
        target={target}
        multiple={multi}
        value={picked}
        filters={field.targetFilter}
        onCreate={onCreate}
        onChange={(next, closing) => {
          setPicked(next);
          if (!multi || closing) onSave(next);
        }}
      />
      {multi ? (
        <div className="flex items-center justify-between gap-2 border-t border-divider p-2">
          <span className="type-caption text-muted-foreground tabular-nums">{m.field.selectedCount.replace('{n}', String(picked.length))}</span>
          <Button size="sm" onClick={() => onSave(picked)}>
            {m.field.validate}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function inputType(field: FieldDef) {
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'percent':
      return 'number';
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime-local';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
}

function ScalarEditor({ field, value, onSave, onCancel, mode }: { field: FieldDef; value: unknown; onSave: (v: unknown) => void; onCancel?: () => void; mode: 'popover' | 'inline' }) {
  const m = useAppMessages();
  const f = useFormatters();
  const initial = field.type === 'datetime' ? f.toLocalInput(value) : field.type === 'date' ? String(value ?? '').slice(0, 10) : String(value ?? '');
  const [v, setV] = React.useState(initial);
  const numeric = field.type === 'number' || field.type === 'currency' || field.type === 'percent';
  const commit = () => {
    if (v === initial) return onCancel?.();
    if (field.type === 'datetime') return onSave(f.fromLocalInput(v));
    if (numeric) return onSave(v === '' ? null : Number(v));
    onSave(v.trim() === '' ? null : v);
  };
  if (field.type === 'longtext' || field.type === 'richtext') {
    return (
      <div className={cn('flex flex-col gap-2', mode === 'popover' && 'p-2')}>
        <Textarea
          autoFocus
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel?.();
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit();
          }}
          rows={4}
          aria-label={field.label}
          placeholder={field.placeholder}
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {m.field.cancel}
          </Button>
          <Button size="sm" onClick={commit}>
            {m.field.save}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={cn(mode === 'popover' && 'p-2')}>
      <Input
        autoFocus
        type={inputType(field)}
        value={v}
        step={field.type === 'currency' ? '0.01' : undefined}
        placeholder={field.placeholder}
        aria-label={field.label}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') onCancel?.();
        }}
        onBlur={commit}
        className={cn(numeric && 'tabular-nums')}
      />
    </div>
  );
}

function ListEditor({ field, initial, onSave, onCancel }: { field: FieldDef; initial: string[]; onSave: (v: string[]) => void; onCancel?: () => void }) {
  const m = useAppMessages();
  const [items, setItems] = React.useState<string[]>(initial);
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const d = draft.trim();
    if (!d) return items;
    const next = items.includes(d) ? items : [...items, d];
    setItems(next);
    setDraft('');
    return next;
  };
  return (
    <div className="flex flex-col gap-2 p-2">
      {items.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {items.map((it) => (
            <li key={it} className="type-body-sm flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1">
              <span className="truncate">{it}</span>
              <button type="button" aria-label={m.field.remove.replace('{value}', it)} className="focus-ring rounded-detail text-muted-foreground hover:text-foreground" onClick={() => setItems(items.filter((x) => x !== it))}>
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <Input
          autoFocus
          value={draft}
          type={field.type === 'emails' ? 'email' : field.type === 'phones' ? 'tel' : 'text'}
          placeholder={field.placeholder ?? m.field.add}
          aria-label={field.label}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft.trim()) add();
              else onSave(items);
            }
            if (e.key === 'Escape') onCancel?.();
          }}
        />
        <Button size="icon" variant="neutral" onClick={add} aria-label={m.field.add}>
          <PlusIcon />
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {m.field.cancel}
        </Button>
        <Button size="sm" onClick={() => onSave(add())}>
          {m.field.save}
        </Button>
      </div>
    </div>
  );
}

export type { Ref };
