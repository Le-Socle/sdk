# Guide pour les agents

Le SDK du Socle fabrique toutes les surfaces d'une société (application, site, présentation, document, e-mail, visuel) à partir d'une seule source de jetons. Aucune marque n'y vit : chaque société branche la sienne. Textes visibles en français, traduisibles (jamais en dur dans un composant sans moyen de les remplacer).

## Où ranger quoi

| Étage | Dossier | Point d'entrée | État |
|---|---|---|---|
| 1. Jetons | `tokens/` (source DTCG : `value/`, `role/`, `component/`, `mode/`), `brands/<id>/` (marques du dépôt), `fonts/` (polices du neutre) | `@le-socle/sdk/tokens` | en place |
| 2. Composants | `src/ui/` (primitives), `src/ui/charts/` (graphiques et données) | `@le-socle/sdk/ui` | en place (lot 2) |
| 3. Archétypes | `src/site/`, `src/slides/`, `src/document/`, `src/email/`, `src/social/`, `src/app/` | `@le-socle/sdk/<support>` | squelettes |
| 4. Gabarits | `templates/` | | à venir |
| 5. Rendu | `src/render/` | `@le-socle/sdk/render` | squelette ; le navigateur de rendu est une dépendance optionnelle |

Exemples : un nouveau type de slide va dans `src/slides/` (un fichier par type, exporté par `src/slides/index.ts`) et sa story dans `stories/slides/`. Un nouveau bouton va dans `src/ui/`, sa story dans `stories/ui/`. Une nouvelle couleur de rôle s'ajoute dans `tokens/role/color.tokens.json` (jamais dans un composant).

## Règles

1. **Aucune valeur de marque dans le SDK** : ni nom de société, ni nom de teinte de charte, ni hex de marque. `npm run check:brands` le cherche dans tout le dépôt suivi.
2. **Aucune couleur, taille, durée ou courbe écrite en dur** hors de `tokens/`, `brands/`, `fonts/`. Un composant lit un rôle (`bg-primary`, `var(--color-text-heading)`), jamais une valeur de palette. `npm run check:hardcoded` le contrôle ; l'exemption `hardcoded-ok: raison` se justifie en revue.
3. **Une pièce, une story** : chaque composant, archétype ou type de slide a sa story dans `stories/`, sur fond clair et sur surface sombre (`data-surface="dark"`), dans les deux marques (sélecteur de la barre d'outils). `npm run verify:stories` rend toutes les stories dans un navigateur headless.
4. **Trois couches de jetons** : valeurs (`value.*`, palette, échelle), rôles (`role.*`, ce que les composants lisent), composants (`component.*`, des alias de rôles). Un composant ne lit jamais une valeur ; un rôle ne lit jamais un composant. `npm run check:tokens`.
5. **Règles d'interface** : gras réservé aux titres ; chiffres tabulaires (pas de police à chasse fixe pour les chiffres) ; actions en haut à droite ; pas de sous-titre explicatif ; pas de défilement horizontal à 1024 px ; arrondis ; casse normale ; montants en € à 2 décimales.
6. **Polices auto-hébergées** : déclarées par la marque dans `fonts.json` avec fichier, licence et repli par support. Aucun appel à `fonts.googleapis.com`.
7. Pas de licence pour l'instant (`UNLICENSED`) : ne pas ajouter de fichier LICENSE.

## Commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run tokens` | Génère les quatre sorties depuis `tokens/` et `brands/` : CSS et thème Tailwind 4, valeurs brutes TypeScript, JSON DTCG (dossier `generated/`, ignoré par git). |
| `npm run check` | Tout ce que la CI vérifie : types, lint, format des jetons, correspondance, noms de marque, valeurs en dur, contrastes WCAG 2.2 AA, tests. |
| `npm run typecheck` / `lint` / `test` | Séparément. |
| `npm run build:lib` | Jetons, puis `dist/` (ESM par point d'entrée, types, feuilles CSS, polices). |
| `npm run build-storybook` | Jetons, puis `storybook-static/`. |
| `npm run verify:stories` | Rend chaque story (neutre et démonstration, clair et sombre, 1440 et 390 px) ; échoue sur erreur, appel distant ou débordement. |

Sur la devbox : jamais de serveur lancé à la main (`storybook dev`, `vite`) ; voir `docs/REGLES-AGENTS-NUIT.md`.

## Brancher une marque

Un paquet de marque contient `brand.json`, `tokens.json` (jetons DTCG qui remplacent des valeurs et des rôles), `fonts.json` (familles, fichiers, licences, replis) et ses fichiers de police. Voir la page « Documentation / Créer une marque » de Storybook et `brands/demo/` (exemple, volontairement éloigné du neutre).

## Composants (étage 2)

- Un fichier par composant dans `src/ui/`, une story dans `stories/ui/`. Les graphiques sont dans `src/ui/charts/` ; ils lisent l'échelle de données de la marque (`--data-count`, `--data-threshold-N`) par `useDataScale` et ne savent pas combien de paliers elle a (4 ou 6).
- Un composant lit des **classes de rôle ou de composant** (`bg-primary`, `h-control-md`, `border-divider`, `bg-chart-track`, `text-data-3-text`). Un jeton de composant manquant s'ajoute dans `tokens/component/components.tokens.json` (alias d'un rôle), jamais en dur ; `npm run tokens` le propage au thème Tailwind. Une surface sombre remappe les jetons de composant dans `tokens/mode/surface-*.tokens.json`.
- **Une seule hauteur de contrôle par taille et par densité** : champ (`Input`), sélecteur (`SelectTrigger`) et `Button` lisent `--control-sm|md|lg` ; la story « Alignement des contrôles » et `verify:stories` le mesurent (`data-aligne`).
- **Textes intégrés** : jamais en dur. `MessagesProvider` (objet `Partial<Messages>`, français par défaut) ou la propriété du composant. Les messages sont des chaînes à gabarit (`'Page {n}'`, `fillMessage`) et non des fonctions : ils passent d'un composant serveur à un composant client.
- **`"use client"`** en tête de tout fichier qui utilise un crochet React, Radix, recharts, cmdk ou sonner. Sans lui, `next build` échoue à la prégénération.
- **Classes de jeton et `cn`** : `src/lib/cn.ts` connaît `h-control-*`, `z-layer-*`, `duration-*`, `type-*`, `rounded-detail|mark|dot`, `shadow-1|2|3` (test : `tests/cn.test.mjs`). Une famille de jeton neuve s'y ajoute.
- **Stories** : `Matrix` (`stories/lib/matrix.tsx`) pose le composant sur fond clair et sur surface sombre, dans les deux densités ; états forcés par `storybook-addon-pseudo-states` (`parameters.pseudo`). Une liste Radix ouverte masque la page (aria-hidden) : l'étiquette `axe-aria-hidden-ok` écarte cette seule règle pour la story concernée.
- Outils : `node scripts/capture-stories.mjs --out <dossier> --match <texte>` (captures à regarder), `node scripts/find-overflow.mjs <id> <largeur>` (cherche ce qui déborde).

## Documents de référence

`docs/PLAN.md` (lots), `docs/decisions/jetons-outil.md` (Terrazzo), `docs/correspondance-jetons.md` (anciens noms de la charte d'origine → noms du SDK), `docs/polices.md`.
