# Plan : SDK du Socle et refonte de Control Tower

22/10/2026. Base : le plan de Yoni (Le-Socle/sdk#1, 41 issues ; apoleos-design-system#13 et lot A7 #36-38 ; Le-Socle/lifeos#8).

## Point de départ
- `Le-Socle/sdk` existe (public, vide). Paquet visé : `@le-socle/sdk`, installé par étiquette git.
- Source du code : `apoleos-design-system` main (0.4.0 + landing v3 : 28 primitives shadcn, mise en scène, composants métier CT) et `lifeos/app/src/components` (coque, tableau de données, filtres, fiche latérale, champs, palette, bandeau de chiffres, frise, organigramme : ~10 800 lignes).
- Control Tower legacy : React 18, Tailwind 3, MUI 6, Vite, 227 composants, 1 226 couleurs en dur. Le SDK exige React 19 et Tailwind 4.

## Périmètre retenu
Ce qui sert la Control Tower et LifeOS d'abord : étages jetons, composants et applications. Site, slides, documents, e-mails, réseaux et rendu en fichiers (lots 3 à 5 hors « Applications ») viennent après, ils ne bloquent pas la refonte.

## Lots
| Lot | Contenu | Issues | Preuve de sortie |
|---|---|---|---|
| L0 Fondations | paquet, points d'entrée `tokens` `ui` `app` (autres en attente), Storybook 10, CI (types, lint, build, rendu des stories), AGENTS.md | sdk#2-5 | installation dans un Next.js vierge, CI verte |
| L1 Jetons | 3 couches (valeurs, rôles, composants), source DTCG, Terrazzo vs Style Dictionary, 4 sorties, thème neutre + marque de démo, échelle à paliers 4/6, `data-surface` | sdk#6-11 | changer une valeur change toutes les sorties ; sélecteur de marque dans Storybook |
| L2 Composants | 28 primitives + barre latérale, pagination, fil d'Ariane, avatar ; graphiques (recharts) ; composants d'application repris de LifeOS ; coque | sdk#13, #16, #17 | une story par pièce, 2 densités, clair et sombre, axe sans violation |
| L3 Épreuve du feu | LifeOS sur le SDK (branche) ; marque APOLEOS branchée ; contrôles automatiques en CI | lifeos#8, sdk#36, #41 | captures avant/après LifeOS identiques ; tests LifeOS verts |
| L4 Control Tower | inventaire des écrans legacy ; correspondance composants legacy → SDK ; composants métier sur le SDK (score, 6 paliers, matrice des familles, carte d'action, tableau de projets, trajectoire) ; prototype des 6 écrans dans Storybook | design-system#16, #37, #38 | 6 écrans enchaînés à 1440 px, données de démo cohérentes |
| L5 Refonte | selon la décision ci-dessous | design-system#36 | — |

## Méthode
- Une issue = une branche = une PR, recette par un agent différent, captures dans la PR. Rien sur `main` sans PR ; Yoni valide les rendus.
- Preuve visuelle obligatoire (méthode du skill tendr-sdk-ui : inventaire, captures 1440/1024, audit DOM, diff pixel, relecture à l'œil).
- Devbox : 2 agents à la fois au plus, commandes lourdes plafonnées, Storybook via devbox-app.

## Décisions (Constantin, 22/10/2026)
1. Travail directement sur `main` de ce dépôt.
2. Aucune licence pour l'instant : code visible, pas réutilisable.
3. Control Tower : une grosse refonte fonctionnelle est en cours ailleurs. Ici, seulement la refonte visuelle des écrans sur le SDK (prototype Storybook, données de démonstration), qui servira ensuite à la refonte.
4. Le moteur d'écrans par métadonnées de LifeOS (`ObjectDef`) est extrait dans le SDK (#24), point d'entrée `app`.
