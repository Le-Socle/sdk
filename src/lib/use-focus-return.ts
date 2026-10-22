import * as React from 'react';

/**
 * Retour du focus pour un dialogue ou un volet, avec ou sans déclencheur.
 *
 * Radix ne rend le focus qu'à son DialogTrigger. Une fenêtre ouverte par un état (une ligne de
 * liste, une action de menu) se referme alors sans focus : la personne qui navigue au clavier
 * repart du haut de la page. Ce crochet retient l'élément qui avait le focus à l'ouverture et le
 * lui rend à la fermeture. Un gestionnaire passé par l'appelant passe d'abord ; s'il appelle
 * preventDefault, le focus n'est pas rendu.
 */
type EvenementDeFocus = { onOpenAutoFocus?: (event: Event) => void; onCloseAutoFocus?: (event: Event) => void };

export function useFocusReturn({ onOpenAutoFocus, onCloseAutoFocus }: EvenementDeFocus) {
  const ouvreur = React.useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => {
      const actif = document.activeElement;
      ouvreur.current = actif instanceof HTMLElement && actif !== document.body ? actif : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      const element = ouvreur.current;
      ouvreur.current = null;
      if (!event.defaultPrevented && element?.isConnected) {
        event.preventDefault();
        element.focus({ preventScroll: true });
      }
    },
  };
}
