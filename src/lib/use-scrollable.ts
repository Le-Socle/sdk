import * as React from 'react';

/**
 * Une zone qui défile doit pouvoir défiler au clavier (WCAG 2.1.1, règle axe
 * `scrollable-region-focusable`). Le crochet mesure la zone : si son contenu dépasse, elle doit
 * recevoir un arrêt de tabulation, un rôle de région et un nom ; sinon elle n'ajoute rien.
 *
 * `const [ref, defile] = useScrollable<HTMLDivElement>()`, puis
 * `<div ref={ref} {...(defile ? { tabIndex: 0, role: 'region', 'aria-label': '…' } : {})} />`.
 */
export function useScrollable<T extends HTMLElement>(): [React.RefCallback<T>, boolean] {
  const [element, setElement] = React.useState<T | null>(null);
  const [defile, setDefile] = React.useState(false);

  React.useEffect(() => {
    if (!element) return;
    const mesurer = () => setDefile(element.scrollHeight > element.clientHeight + 1);
    mesurer();
    const redimensionnement = new ResizeObserver(mesurer);
    const observer = () => {
      redimensionnement.disconnect();
      redimensionnement.observe(element);
      for (const enfant of Array.from(element.children)) redimensionnement.observe(enfant);
    };
    observer();
    const mutations = new MutationObserver(() => {
      observer();
      mesurer();
    });
    mutations.observe(element, { childList: true, subtree: true, characterData: true });
    return () => {
      redimensionnement.disconnect();
      mutations.disconnect();
    };
  }, [element]);

  return [setElement, defile];
}
