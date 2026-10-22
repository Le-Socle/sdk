'use client';

import * as React from 'react';
import { PencilIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useAppMessages, useDataSource, useNotifier } from '../engine/provider';
import { useMutation } from '../engine/use-mutation';
import type { FieldDef, ObjectKey } from '../engine/types';
import { FieldDisplay } from './field-display';
import { FieldEditor } from './field-editor';

const WIDE = new Set(['tags', 'relation', 'relations', 'user', 'users', 'emails', 'phones', 'textlist', 'longtext']);

/**
 * Champ affiché, modifiable sur place. L'éditeur s'ouvre dans une fenêtre flottante posée sur la
 * cellule : la cellule garde exactement sa hauteur de repos (aucun saut de ligne en cours d'édition).
 * `onSaved` laisse l'application réagir (par exemple une fenêtre métier pour certaines valeurs).
 */
export function EditableField({
  object,
  id,
  field,
  value,
  row,
  variant = 'cell',
  className,
  onCreateRelated,
  defaultOpen = false,
}: {
  /** Éditeur ouvert au départ (stories, tests). */
  defaultOpen?: boolean;
  object: ObjectKey;
  id: string;
  field: FieldDef;
  value: unknown;
  row?: Record<string, unknown>;
  variant?: 'cell' | 'detail' | 'header';
  className?: string;
  onCreateRelated?: (target: string, search: string) => Promise<{ id: string; label: string } | null> | { id: string; label: string } | null;
}) {
  const m = useAppMessages();
  const ds = useDataSource();
  const notifier = useNotifier();
  const [open, setOpen] = React.useState(defaultOpen);
  const { mutate, pending } = useMutation((patch: Record<string, unknown>) => ds.update(object, id, patch));
  const display = <FieldDisplay field={field} value={value} row={row} variant={variant === 'cell' ? 'cell' : 'detail'} />;

  if (field.readOnly) {
    return <div className={cn('flex min-h-control-sm min-w-0 items-center', className)}>{display}</div>;
  }

  const save = (v: unknown) => {
    if (field.required && (v === null || v === undefined || v === '')) {
      notifier.error(m.field.required.replace('{label}', field.label));
      return;
    }
    setOpen(false);
    void mutate({ [field.key]: v });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          data-field={field.key}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setOpen(true);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className={cn(
            'group/edit focus-ring relative flex min-h-control-sm min-w-0 items-center rounded-md text-left transition-colors duration-micro hover:bg-muted',
            // Le déclencheur déborde de 2 unités de chaque côté (sa zone de survol) : sa largeur les compense,
            // pour que la valeur reste alignée sur l'en-tête de la colonne.
            variant === 'header' ? 'w-max max-w-full' : 'w-[calc(100%+var(--spacing)*4)]',
            '-mx-2 px-2',
            pending && 'opacity-60',
            open && 'bg-muted',
            className,
          )}
        >
          {/* Le nom accessible commence par l'action puis contient la valeur visible (WCAG 2.5.3). */}
          <span className="sr-only">{m.field.edit.replace('{label}', field.label)} : </span>
          <span className={cn('min-w-0', variant === 'header' ? '' : 'flex-1 truncate')}>{display}</span>
          {variant !== 'cell' ? <PencilIcon className="ml-1 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-micro group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100" aria-hidden="true" /> : null}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn('p-0', WIDE.has(field.type) ? 'w-80' : field.type === 'select' ? 'w-60' : 'w-72')} onClick={(e) => e.stopPropagation()}>
        <FieldEditor field={field} value={value} onSave={save} onCancel={() => setOpen(false)} onCreateRelated={onCreateRelated} />
      </PopoverContent>
    </Popover>
  );
}
