# Choix de l'outil de jetons : Terrazzo ou Style Dictionary

Issue #8. Essai fait le 22/10/2026 sur une vingtaine de jetons représentatifs (couleurs sRGB et OKLCH, alias à deux niveaux, dimension, durée, courbe, famille, graisse, ombre composite avec alias de couleur), avec une marque de remplacement et un thème sombre. Les fichiers de l'essai sont dans `docs/decisions/jetons-essai/` (non lancés par la CI).

Versions : `@terrazzo/cli`, `parser`, `plugin-css`, `plugin-tailwind`, `plugin-js` 2.10.0 ; `style-dictionary` 5.7.0 ; Node 22.

## Ce qui a été essayé

| Besoin | Terrazzo 2.10 | Style Dictionary 5.7 |
|---|---|---|
| Lire un fichier DTCG 2025.10 (couleur en objet `colorSpace`/`components`, dimension `{value, unit}`, durée, `$root`) | Oui, nativement. `tz check` valide ; les erreurs de type sont rapportées. | Oui avec `usesDtcg: true`. La couleur OKLCH est convertie en hex (perte de la gamme large). |
| Plusieurs marques et thèmes dans un seul système | Oui : le « resolver » 2025.10 (`modifiers`, `contexts`, `resolutionOrder`) est lu tel quel ; `resolver.apply({ brand: 'demo', mode: 'dark' })` rend l'arbre résolu. 4 axes essayés (marque, mode, surface, densité) : 416 jetons, 248 différences entre marque de démonstration et neutre en sombre. | Pas de resolver. Un contexte = une construction séparée avec `source` différent et un filtre pour ne sortir que ce qui change. |
| Une marque qui remplace une valeur | Un fichier de plus dans un contexte du modificateur « brand » : aucun avertissement. | Le remplacement passe, mais chaque jeton redéfini lève « Token collisions detected » (dans l'essai : 3 collisions pour le mode sombre, 7 pour la marque, composantes de couleur comprises) ; l'avertissement est faux ici et il faut le faire taire à la main. |
| Alias conservés dans la sortie | Oui : `aliasOf`, `partialAliasOf` (alias dans une ombre composite), `originalValue`. | Oui avec `outputReferences: true`, y compris l'alias de couleur dans l'ombre composite (`var(--palette-ink-8)`) dans l'essai `sd2.mjs`. Les formats JSON (`json/nested`) aplatissent les valeurs et perdent les alias. |
| Variables CSS | `plugin-css` : sortie correcte, mais chaque permutation répète tous les jetons (aucun « seulement ce qui change »). | `css/variables` : propre pour un contexte ; le « seulement ce qui change » passe par un filtre écrit à la main. |
| Thème Tailwind 4 | `plugin-tailwind` demande un gabarit `@tz` et produit des variables `@theme` ; l'essai a donné « matched 0 tokens » avec la configuration documentée en 2.x. | Pas de format Tailwind 4 livré. |
| Valeurs brutes TypeScript | `plugin-js` : fonctionne, un objet par permutation. | `javascript/es6` : fonctionne, mais sans les permutations. |
| JSON DTCG de sortie | À écrire (les jetons résolus sont en mémoire avec leur `originalValue`). | `json/nested` : valeurs aplaties, alias perdus ; format DTCG en sortie non fourni. |

## Décision

**Terrazzo, pour l'analyse, la validation et le resolver. Les quatre sorties sont écrites par le SDK** (`scripts/lib/tokens-core.mjs`), à partir de l'arbre que Terrazzo résout.

Pourquoi :
1. Le resolver 2025.10 est exactement le mécanisme voulu : une marque est un contexte, le sombre complet, la surface sombre et la densité sont des axes. Style Dictionary n'a pas d'équivalent, il faudrait rebâtir un resolver autour.
2. Terrazzo garde les alias et le type DTCG de chaque jeton. C'est ce qui permet la règle « un composant lit un rôle, jamais une valeur » (contrôlée dans `check-tokens.mjs`) et un JSON de sortie qui garde ses alias (Figma, Penpot).
3. Les plugins de Terrazzo ne couvrent pas nos besoins fins : sortie « seulement ce qui change » pour la feuille d'une marque, sélecteurs doublés (`:root[data-theme="dark"]`) pour que le sombre du SDK passe devant le `:root` d'une marque, redéclaration des jetons dépendants dans un bloc `data-surface`, durées réduites sous `prefers-reduced-motion`, cible tactile sous pointeur grossier, taille fluide. Utiliser Terrazzo comme bibliothèque (`parse`) et écrire les émetteurs est plus court et plus lisible que de contourner `plugin-css` et `plugin-tailwind`. Coût assumé : ~500 lignes à maintenir dans `tokens-core.mjs`.
4. Le test automatique (`tests/tokens-propagation.test.mjs`) prouve que changer une valeur change les sorties ; il couvre nos émetteurs, pas ceux d'un plugin.

Ce que Terrazzo ne vérifie pas : il accepte des composantes de couleur qui ne sont pas des nombres. `check-tokens.mjs` ajoute un contrôle de forme sur les couleurs, dimensions, durées, courbes, familles et ombres, avec un test qui le prouve.

Si Terrazzo disparaît ou casse son format : la source est du DTCG 2025.10 standard, Style Dictionary la lit (essai `sd2.mjs`) ; il faudrait réécrire le resolver (une fonction `apply` de ~150 lignes).

## Risques

- Terrazzo est en 2.x et son API JS (`parse`, `defineConfig`) peut changer : la version est figée par `package-lock.json` et par la CI.
- Les extensions du SDK (`org.le-socle` : `fluid`, `coarse`, `reducedMotion`, `unit`) ne sont pas du DTCG : un outil de design les ignore sans casser.
