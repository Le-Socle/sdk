'use client';

import { cn } from '../../lib/cn';
import { Icon } from './icons';
import { DOT_CLASS, PILL_CLASS, toneOf } from './tints';

/** Pastille de valeur (statut, étape, canal) : ton lu sur les rôles, icône facultative. */
export function Pill({ color, icon, children, className }: { color?: string; icon?: string; children: React.ReactNode; className?: string }) {
  return (
    <span data-slot="pill" className={cn('type-label-sm inline-flex h-5 max-w-full items-center gap-1 truncate rounded-detail border px-2', PILL_CLASS[toneOf(color)], className)}>
      {icon ? <Icon name={icon} className="size-3 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Point de couleur du ton. */
export function Dot({ color, className }: { color?: string; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 rounded-dot', DOT_CLASS[toneOf(color)], className)} />;
}
