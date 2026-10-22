# SDK du Socle

Un SDK sans marque pour toutes les surfaces d'une société : applications, site, présentations, documents, e-mails, visuels. La société y branche ses jetons, ses polices et son logo ; toutes ses surfaces prennent le même style. React 19, TypeScript, Tailwind 4, shadcn/ui, Storybook 10.

Pas de licence pour l'instant : le code est visible, pas réutilisable.

## Les cinq étages

| Étage | Contenu | Dossier |
|---|---|---|
| 1. Jetons | valeurs, rôles, composants ; une source DTCG pour tous les supports | `tokens/`, `brands/` |
| 2. Composants | briques génériques | `src/ui/` |
| 3. Archétypes | blocs par support : site, slides, document, e-mail, réseaux, application | `src/<support>/` |
| 4. Gabarits | un site, un deck, une annonce prêts à remplir | `templates/` |
| 5. Rendu | PDF, image, e-mail envoyé | `src/render/` |

Storybook montre chaque étage, support par support. Les lots 0 et 1 (fondations, jetons) sont faits ; les composants arrivent ensuite.

## Installer

```sh
npm install github:Le-Socle/sdk#v0.4.0
```

Avec Next.js et Tailwind 4, l'application déclare elle-même `tailwindcss` et `@tailwindcss/postcss` (le SDK ne les impose pas : `tailwindcss` est un pair facultatif). Sans eux, `next build` échoue avec « Cannot find module '@tailwindcss/postcss' ». Après un changement de dépendances, supprimer le dossier `.next` : Turbopack garde sinon l'ancienne résolution et l'erreur persiste alors que `next build --webpack` passe.

Dépôt public : aucun jeton. Installer le paquet n'installe aucun navigateur ; un navigateur de rendu est une dépendance optionnelle des exports.

```ts
import { neutral, raw } from '@le-socle/sdk/tokens';   // valeurs brutes (e-mail, PowerPoint, graphiques)
import { Button, Input, MessagesProvider, BarChart } from '@le-socle/sdk/ui';   // 33 primitives + graphiques
```

## Brancher une marque

Une marque est un petit paquet : un `tokens.json` (jetons DTCG qui remplacent des valeurs et des rôles), un `fonts.json` (familles, fichiers, licence, repli par support), ses fichiers de police, les paliers de son échelle de données (4 ou 6).

Côté web, la feuille de la marque passe **après** celle du SDK :

```css
@import "@le-socle/sdk/tokens.css";
@import "@le-socle/sdk/theme.css";   /* thème Tailwind 4 */
@import "@le-socle/sdk/base.css";
@import "@ma-societe/marque/brand.css";
@import "tailwindcss/utilities.css" layer(utilities) source(none);
```

`theme.css` déclare lui-même où sont les composants compilés (`@source`) : l'application n'écrit aucun `@source` pour `node_modules`. Les composants viennent avec `radix-ui`, `recharts`, `cmdk`, `sonner`, `lucide-react` et `class-variance-authority` (dépendances du paquet).

Textes intégrés en français par défaut ; pour une autre langue : `<MessagesProvider messages={{ close: 'Close', previous: 'Previous' }}>`.

Pour fabriquer la feuille d'une marque hors de ce dépôt, le SDK installé suffit : `npx socle-brand build <dossier-de-la-marque> --out generated-brand` (écrit `brand.css`, `fonts.css`, les polices, les valeurs brutes TypeScript et le JSON DTCG).

Côté valeurs brutes, le paquet de la marque exporte le même objet que `neutral` et on le passe aux e-mails, au PowerPoint, aux graphiques. Thème clair par défaut ; `data-theme="dark"` pour le sombre complet, `data-surface="dark"` pour une section sombre. Un exemple complet : `brands/demo/` ; le pas à pas : page « Créer une marque » de Storybook.

## Travailler dans le dépôt

```sh
npm ci
npm run check            # types, lint, jetons, contrastes, tests
npm run build-storybook  # puis npm run verify:stories
```

Agents : lire [AGENTS.md](./AGENTS.md).
