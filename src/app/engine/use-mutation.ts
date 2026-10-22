'use client';

import * as React from 'react';
import { useInvalidate, useNotifier } from './provider';

export interface MutationOptions<R> {
  /** Message de réussite, ou fonction du résultat. */
  success?: string | ((r: R) => string);
  onSuccess?: (r: R) => void;
  onError?: (e: Error) => void;
}

/**
 * Écriture : appelle la source, notifie le résultat, puis recharge toutes les lectures. Une erreur
 * est notifiée et renvoyée à `onError` ; l'appelant n'a jamais à attraper la promesse.
 */
export function useMutation<A, R = void>(fn: (arg: A) => Promise<R>, opts: MutationOptions<R> = {}) {
  const notifier = useNotifier();
  const invalidate = useInvalidate();
  const [pending, setPending] = React.useState(false);
  const optsRef = React.useRef(opts);
  optsRef.current = opts;
  const fnRef = React.useRef(fn);
  fnRef.current = fn;
  const mutate = React.useCallback(
    async (arg: A, local?: MutationOptions<R>) => {
      setPending(true);
      try {
        const r = await fnRef.current(arg);
        const s = optsRef.current.success;
        if (s) notifier.success(typeof s === 'function' ? s(r) : s);
        invalidate();
        optsRef.current.onSuccess?.(r);
        local?.onSuccess?.(r);
        return r;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        notifier.error(err.message);
        optsRef.current.onError?.(err);
        local?.onError?.(err);
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [notifier, invalidate],
  );
  return { mutate, pending };
}
