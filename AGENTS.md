# Guide pour les agents

Le SDK du Socle fabrique toutes les surfaces d'une société (application, site, présentation, document, e-mail, visuel) à partir d'une seule source de jetons. Aucune marque n'y vit : chaque société branche la sienne. Textes visibles en français, traduisibles (jamais en dur dans un composant sans moyen de les remplacer).

## Où ranger quoi

| Étage | Dossier | Point d'entrée | État |
|---|---|---|---|
| 1. Jetons | `tokens/` (source DTCG : `value/`, `role/`, `component/`, `mode/`), `brands/<id>/` (marques du dépôt), `fonts/` (polices du neutre) | `@le-socle/sdk/tokens` | en place |
| 2. Composants | `src/ui/` | `@le-socle/sdk/ui` | squelette, rempli au lot 2 |
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

## Documents de référence

`docs/PLAN.md` (lots), `docs/decisions/jetons-outil.md` (Terrazzo), `docs/correspondance-jetons.md` (anciens noms de la charte d'origine → noms du SDK), `docs/polices.md`.
