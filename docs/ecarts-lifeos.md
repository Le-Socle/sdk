# Écarts entre les composants de LifeOS et ceux du SDK

Source comparée : `lifeos/app/src/components/ui` (20 fichiers, lecture seule) et le design system d'origine (primitives shadcn habillées, dépôt `design-system-git`). LifeOS devra basculer sur `@le-socle/sdk/ui` sans changer un écran ; ce document liste ce que le SDK garde, ce qu'il change, et ce que LifeOS doit adapter (une couche de réexport, pas des écrans).

## Ce que LifeOS enveloppe aujourd'hui

| Fichier LifeOS | Ce qu'il fait | Équivalent SDK |
|---|---|---|
| `button.tsx` | Renomme variantes et tailles du design system | `Button` : les noms de LifeOS sont à mapper (tableau ci-dessous) |
| `input.tsx` | `dense` vrai par défaut | `Input size="md"` (hauteur `--control-md`, texte 13 px). La propriété `dense` n'existe plus |
| `tabs.tsx` | Réexport, forme pastille | `TabsList variant="pill"` : identique |
| 17 autres (`dialog`, `sheet`, `select`, `command`, `dropdown-menu`…) | Réexport tel quel | Mêmes noms et mêmes sous-composants dans le SDK |

## Boutons : correspondance

| LifeOS (variante) | SDK |
|---|---|
| `default` | `default` |
| `outline` | `neutral` |
| `secondary` | `secondary` |
| `ghost` | `ghost` |
| `destructive` | `danger` |
| `quiet-destructive` | `danger-quiet` |
| `link` | `link` |

| LifeOS (taille) | SDK |
|---|---|
| `default` | `md` (aussi accepté : `default`, `app`) |
| `xs`, `sm` | `sm` (alias `app-sm`) |
| `lg` | `lg` (alias `app-lg`) |
| `icon` | `icon` (alias `app-icon`) |
| `icon-xs`, `icon-sm` | `icon-sm` (alias `app-icon-sm`) |
| `icon-lg` | `icon-lg` |

Le SDK accepte aussi les anciens noms `app`, `app-sm`, `app-lg`, `app-icon`, `app-icon-sm` : l'enveloppe de LifeOS peut rester telle quelle pendant la bascule, en changeant seulement l'import. Les tailles `sm`, `md`, `lg` lisent `--control-sm|md|lg`, comme le champ et le sélecteur : trois hauteurs identiques par densité.

## Écarts de comportement à connaître

1. **Hauteur du champ.** L'ancien `Input` « normal » faisait 44 px (page de site) et le `dense` 32/36 px (application). Le SDK n'a plus qu'une échelle : `sm` 28/32, `md` 32/36, `lg` 40/44 px, selon la densité. Un écran de LifeOS qui écrit `dense` (le défaut de son enveloppe) passe à `size="md"` : même hauteur qu'avant. Un champ de formulaire de site qui voulait 44 px prend `size="lg"` en densité confortable.
2. **Arrondis.** Les composants sont arrondis (`rounded-md` pour champs, boutons, menus ; `rounded-lg` pour carte et fenêtre ; `rounded-dot` pour radio, interrupteur, avatar). Les angles droits du design system d'origine ne sont pas repris.
3. **Danger.** Le bouton `danger` est un contour qui prend un fond d'erreur pâle au survol (texte `status-error-text`, 4,5:1 vérifié sur clair, sombre et surfaces sombres). L'ancien plein rouge au survol ne passait pas le contraste en texte sur fond clair (3,4:1).
4. **Textes intégrés.** « Fermer », « Contenu de la fenêtre », « Palette de commandes »… viennent de `MessagesProvider` (français par défaut). `FieldLabel` : `(obligatoire)` est surchargeable (`requiredLabel`).
5. **Retour du focus et zones qui défilent.** `useFocusReturn` et `useScrollable` sont repris tels quels (dans `src/lib`), `Dialog` et `Sheet` les emploient comme avant.
6. **`Badge`.** Variantes `neutral | info | success | warning | danger` inchangées ; les couleurs passent par des jetons de composant (`badge-*`).
7. **Filets discrets.** Séparation de lignes de tableau et de zones d'une fenêtre : classe `border-divider` (jeton de composant `divider`), qui suit la surface sombre. L'ancien `border-subtle` ne la suivait pas.
8. **Danger discret et survol sur surface sombre.** Jeton `button.danger-quiet-hover-bg` : sur surface sombre, fond de carte au lieu du rose pâle (texte illisible).

## Ajouts qui n'existaient pas dans LifeOS

Barre latérale (`Sidebar*`, jetons `sidebar-*` existants), `Pagination`, `Breadcrumb`, `Avatar`, `NavigationMenu`. LifeOS a sa propre coque d'application (`app/`) : elle sera comparée au lot 2 bis (#17), pas ici.

## Reste à faire côté LifeOS (hors SDK)

- Remplacer le paquet du design system d'origine par `@le-socle/sdk/ui` dans les 20 fichiers `components/ui` et mapper les noms ci-dessus.
- Charger `@le-socle/sdk/tokens.css`, `theme.css`, `base.css` et la feuille de la marque de la société (paquet à créer) dans l'ordre documenté dans le README.
- Retirer les `dense` des `Input`.
