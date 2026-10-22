'use client';

import * as React from 'react';
import { useEngineVersion } from './provider';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  /** Relance la lecture (bouton « Réessayer »). */
  reload(): void;
}

/**
 * Lecture asynchrone minimale : relancée quand `deps` change ou après une écriture (version du
 * moteur). Garde l'ancienne donnée affichée pendant le rechargement. Remplace une bibliothèque de
 * cache : le SDK n'impose pas la sienne à l'application.
 */
export function useAsync<T>(load: () => Promise<T>, deps: React.DependencyList, enabled = true): AsyncState<T> {
  const version = useEngineVersion();
  const [state, setState] = React.useState<{ data: T | undefined; error: Error | null; loading: boolean }>({ data: undefined, error: null, loading: enabled });
  const [manual, setManual] = React.useState(0);
  const loadRef = React.useRef(load);
  loadRef.current = load;
  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loadRef.current().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error: unknown) => alive && setState((s) => ({ data: s.data, error: error instanceof Error ? error : new Error(String(error)), loading: false })),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, manual, enabled]);
  const reload = React.useCallback(() => setManual((m) => m + 1), []);
  return { ...state, reload };
}

/** Valeur retardée (recherche : le champ se remplit tout de suite, la requête suit). */
export function useDebounced<T>(value: T, ms = 180): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
