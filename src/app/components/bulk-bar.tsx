'use client';

import * as React from 'react';
import { ChevronDownIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { fillTemplate, pick } from '../engine/messages';
import { useAppMessages, useDataSource } from '../engine/provider';
import { useMutation } from '../engine/use-mutation';
import { resolveFields } from '../engine/registry';
import type { FieldDef, ObjectDef } from '../engine/types';
import type { Row } from '../engine/query';
import { FieldEditor } from '../fields/field-editor';
import { Icon } from './icons';

/**
 * Barre d'actions groupées sur la sélection d'une liste : modifier un champ, actions métier de
 * l'objet marquées `bulk`, supprimer (avec confirmation), annuler. Posée en bas de l'écran, au-dessus
 * du contenu.
 */
export function BulkBar({ def, ids, rows, onDone }: { def: ObjectDef; ids: string[]; rows?: Row[]; onDone: () => void }) {
  const m = useAppMessages();
  const ds = useDataSource();
  const [field, setField] = React.useState<FieldDef | null>(null);
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const n = ids.length;
  const editable = resolveFields(def, def.bulkEditable ?? []);
  const update = useMutation((a: { patch: Record<string, unknown> }) => ds.bulkUpdate(def.key, ids, a.patch), {
    success: fillTemplate(pick(n, m.bulk.updatedOne, m.bulk.updatedMany), { n }),
  });
  const del = useMutation(() => ds.remove(def.key, ids), {
    success: (r) => fillTemplate(pick(r.count, m.bulk.deletedOne, m.bulk.deletedMany), { n: r.count }),
  });
  const run = useMutation((a: { method: string; input?: Record<string, unknown> }) =>
    ds.runAction ? ds.runAction(a.method, { ids, ...a.input }) : Promise.resolve(undefined),
  );
  const actions = (def.actions ?? []).filter((a) => a.bulk && (!a.when || (rows ?? []).every((r) => a.when!.in.includes(r[a.when!.key]))));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-layer-sheet flex justify-center px-4">
      <div role="toolbar" aria-label={m.bulk.toolbar} className="pointer-events-auto type-body-sm flex items-center gap-1 rounded-lg border border-border bg-popover p-2 pl-4 text-popover-foreground shadow-2">
        <span className="mr-2 text-heading tabular-nums">{fillTemplate(pick(n, m.bulk.selectedOne, m.bulk.selectedMany), { n })}</span>
        {editable.length > 0 ? (
          <Popover
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setField(null);
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="neutral" size="sm">
                {m.bulk.edit} <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" side="top" className="w-72 p-0">
              {!field ? (
                <div className="flex flex-col p-1">
                  {editable.map((f) => (
                    <button key={f.key} type="button" onClick={() => setField(f)} className="focus-ring-inset type-body-sm flex h-control-md items-center rounded-md px-2 text-left hover:bg-muted">
                      {f.label}
                    </button>
                  ))}
                </div>
              ) : (
                <FieldEditor
                  field={field}
                  value={null}
                  onCancel={() => setField(null)}
                  onSave={(v) => {
                    void update.mutate({ patch: { [field.key]: v } }, { onSuccess: onDone });
                    setOpen(false);
                    setField(null);
                  }}
                />
              )}
            </PopoverContent>
          </Popover>
        ) : null}
        {actions.map((a) => (
          <Button key={a.key} variant="neutral" size="sm" onClick={() => void run.mutate({ method: a.method, input: a.input }, { onSuccess: onDone })}>
            {a.icon ? <Icon name={a.icon} /> : null}
            {a.label}
          </Button>
        ))}
        {!def.undeletable ? (
          <Button variant="danger-quiet" size="sm" onClick={() => setConfirm(true)}>
            <Trash2Icon /> {m.bulk.delete}
          </Button>
        ) : null}
        <Button variant="ghost" size="icon-sm" aria-label={m.bulk.cancel} onClick={onDone}>
          <XIcon />
        </Button>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{fillTemplate(pick(n, m.bulk.confirmTitleOne, m.bulk.confirmTitleMany), { n })}</AlertDialogTitle>
            <AlertDialogDescription>{m.bulk.confirmBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.bulk.confirmCancel}</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={() => void del.mutate(undefined as never, { onSuccess: onDone })}>
              {m.bulk.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
