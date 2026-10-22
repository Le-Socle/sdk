'use client';

import { cn } from '../../lib/cn';
import { initials } from '../engine/formatters';
import { PILL_CLASS, toneFor } from './tints';

/** Pastille d'initiales d'une personne : ton stable dérivé du nom, aucune image. */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      data-slot="user-avatar"
      aria-hidden="true"
      className={cn('type-label-sm inline-flex size-6 shrink-0 select-none items-center justify-center rounded-dot border', PILL_CLASS[toneFor(name)], className)}
    >
      {initials(name)}
    </span>
  );
}
