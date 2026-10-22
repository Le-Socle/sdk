'use client';

import { AlertTriangleIcon, RotateCwIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Skeleton, SkeletonGroup } from '../../ui/skeleton';
import { useAppMessages } from '../engine/provider';
import type { IconComponent } from '../engine/contracts';

/** État vide : titre, explication facultative, action facultative (en dessous, jamais en sous-titre de page). */
export function EmptyState({
  icon: IconC,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon?: IconComponent;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const m = useAppMessages();
  return (
    <div data-slot="empty-state" className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-1 py-6' : 'gap-2 py-14', className)}>
      {IconC ? (
        <div className={cn('mb-1 flex items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground', compact ? 'size-8' : 'size-10')}>
          <IconC className={compact ? 'size-4' : 'size-5'} />
        </div>
      ) : null}
      <p className="type-heading text-heading">{title ?? m.states.emptyTitle}</p>
      {description ? <p className="type-body-sm max-w-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Erreur de chargement, avec « Réessayer » quand l'appelant sait relancer. */
export function ErrorState({ message, onRetry, className }: { message?: string; onRetry?: () => void; className?: string }) {
  const m = useAppMessages();
  return (
    <div data-slot="error-state" role="alert" className={cn('flex flex-col items-center justify-center gap-2 py-10 text-center', className)}>
      <div className="flex size-10 items-center justify-center rounded-lg border border-status-error-border bg-status-error-bg text-status-error-text">
        <AlertTriangleIcon className="size-5" />
      </div>
      <p className="type-heading text-heading">{m.states.errorTitle}</p>
      {message ? <p className="type-body-sm max-w-sm text-muted-foreground">{message}</p> : null}
      {onRetry ? (
        <Button variant="neutral" size="sm" onClick={onRetry} className="mt-1">
          <RotateCwIcon /> {m.states.retry}
        </Button>
      ) : null}
    </div>
  );
}

/** Lignes de chargement : des barres grises à la hauteur d'une ligne de tableau. */
export function LoadingRows({ rows = 6, className }: { rows?: number; className?: string }) {
  const m = useAppMessages();
  return (
    <SkeletonGroup label={m.states.loading} aria-busy="true" className={cn('flex flex-col gap-2 p-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-control-md w-full" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </SkeletonGroup>
  );
}
