'use client';

import * as React from 'react';
import type { ObjectKey } from '../engine/types';
import { useMemoryStack, useNavigation, useRegistry, useStore } from '../engine/provider';

export interface DrawerEntry {
  object: ObjectKey;
  id: string;
}

export type DrawerMode = 'panel' | 'modal' | 'full';

const SEP = '~';

export function parseStack(v: string | null | undefined, has: (k: string) => boolean = () => true): DrawerEntry[] {
  if (!v) return [];
  return v
    .split(SEP)
    .map((part) => {
      const [object, id] = part.split('.');
      return { object: object as ObjectKey, id: id as string };
    })
    .filter((e) => e.id && e.object && has(e.object));
}

export function serializeStack(stack: DrawerEntry[]): string {
  return stack.map((e) => `${e.object}.${e.id}`).join(SEP);
}

const MODE_KEY = 'drawer-mode';

/** Mode d'affichage mémorisé dans le stockage de l'application (panneau latéral, fenêtre, plein écran). */
export function useDrawerMode(): [DrawerMode, (m: DrawerMode) => void] {
  const store = useStore();
  const [mode, setMode] = React.useState<DrawerMode>('panel');
  React.useEffect(() => {
    const v = store.get(MODE_KEY);
    if (v === 'modal' || v === 'full') setMode(v);
  }, [store]);
  const set = React.useCallback(
    (m: DrawerMode) => {
      setMode(m);
      store.set(MODE_KEY, m);
    },
    [store],
  );
  return [mode, set];
}

/**
 * Pile de fiches : dans l'URL (`?d=projet.<id>~personne.<id>`) quand l'application fournit une
 * navigation — le fil d'Ariane, le bouton précédent et les liens partagés marchent — sinon en
 * mémoire. `?full=1` force le plein écran.
 */
export function useDrawer() {
  const nav = useNavigation();
  const registry = useRegistry();
  const [memory, setMemory] = useMemoryStack();
  const [mode, setMode] = useDrawerMode();
  const raw = nav ? nav.searchParams.get('d') : memory;
  const stack = React.useMemo(() => parseStack(raw, registry.has), [raw, registry]);
  const forcedFull = nav?.searchParams.get('full') === '1';

  const go = React.useCallback(
    (next: DrawerEntry[], opts: { full?: boolean } = {}) => {
      if (!nav) {
        setMemory(serializeStack(next));
        return;
      }
      const p = new URLSearchParams(nav.searchParams.toString());
      if (next.length) p.set('d', serializeStack(next));
      else p.delete('d');
      if (opts.full === false || !next.length) p.delete('full');
      const qs = p.toString();
      nav.push(qs ? `${nav.pathname}?${qs}` : nav.pathname, { scroll: false });
    },
    [nav, setMemory],
  );

  const current = stack[stack.length - 1] as DrawerEntry | undefined;
  const effectiveMode: DrawerMode = forcedFull ? 'full' : mode;
  return {
    stack,
    current,
    mode: effectiveMode,
    full: effectiveMode === 'full',
    /** Ouvre un enregistrement ; depuis une fiche, il s'empile. */
    open(object: ObjectKey, id: string, opts: { root?: boolean } = {}) {
      const last = stack[stack.length - 1];
      if (last && last.object === object && last.id === id) return;
      const existing = stack.findIndex((e) => e.object === object && e.id === id);
      if (existing >= 0 && !opts.root) return go(stack.slice(0, existing + 1));
      go(opts.root ? [{ object, id }] : [...stack, { object, id }]);
    },
    backTo: (index: number) => go(stack.slice(0, index + 1)),
    back: () => go(stack.slice(0, -1)),
    close: () => go([]),
    setMode(m: DrawerMode) {
      setMode(m);
      if (forcedFull && m !== 'full') go(stack, { full: false });
    },
  };
}
