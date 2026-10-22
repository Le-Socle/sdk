import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Fusion de classes Tailwind, configurée pour les classes du SDK. tailwind-merge ne connaît que les
// classes de Tailwind : `rounded-mark`, `h-control-md`, `type-label`, `z-layer-menu` lui sont
// étrangères, il ne voit pas qu'elles se contredisent et garde les deux, puis c'est l'ordre des
// règles dans le CSS qui décide, pas l'ordre des classes. Chaque ligne ci-dessous nomme une famille
// de jetons ; tests/cn.test.mjs la vérifie. Une classe de jeton neuve (rayon, durée, couche, rôle
// typographique) s'ajoute ici avec le jeton.
const HAUTEURS = ['control-sm', 'control-md', 'control-lg', 'control-touch', 'row-single', 'row-double'];

const twMerge = extendTailwindMerge<'type-role'>({
  extend: {
    theme: {
      radius: ['detail', 'mark', 'dot'],
      shadow: ['1', '2', '3'],
    },
    classGroups: {
      // Hauteurs de contrôle et de ligne : --control-*, --row-* (h-control-md, min-h-row-double).
      h: [{ h: HAUTEURS }],
      'min-h': [{ 'min-h': HAUTEURS }],
      // Couches d'empilement : --layer-* (z-layer-menu).
      z: [{ z: ['layer-sticky', 'layer-sheet', 'layer-dialog', 'layer-menu', 'layer-toast', 'layer-tooltip'] }],
      // Durées de mouvement : --duration-* (duration-fast).
      duration: [{ duration: ['micro', 'fast', 'normal', 'slow', 'slower'] }],
      // Rôles typographiques : une classe type-* pose la police, la taille, l'interligne et la graisse.
      'type-role': [
        {
          type: ['display', 'title', 'subtitle', 'heading', 'lede', 'body', 'body-sm', 'label', 'label-lg', 'caption', 'label-sm', 'overline', 'label-caps', 'figure', 'figure-sm'],
        },
      ],
    },
    // Un rôle typographique remplace la taille, la graisse, l'interligne et la famille posés avant lui.
    conflictingClassGroups: {
      'type-role': ['font-size', 'font-weight', 'font-family', 'leading'],
    },
  },
});

/** Assemble des classes Tailwind et résout les conflits (la dernière gagne). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
