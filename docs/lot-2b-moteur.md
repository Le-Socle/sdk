# Lot 2b : composants d'application et moteur d'écrans (`@le-socle/sdk/app`)

État au 22/10/2026 (issues #17 et #24). Plan complet : analyse et plan d'extraction du lot (hors dépôt).

## Fait

- **Moteur** (`src/app/engine`) : types (`ObjectDef`, `FieldDef`, options, cockpits), registre, évaluation locale des filtres, tris, recherche et regroupements (`query.ts`), formats (`createFormatters` : `moneyDigits` 2 par défaut, 0 possible), textes (`AppMessages`, français par défaut, surchargeables par section), contrats d'adaptateurs (`DataSource`, `Navigation`, `AppSession`, `KeyValueStore`, `Notifier`, `IconSet`, `EngineSlots`) et `AppEngineProvider`. Lectures asynchrones (`useAsync`) et écritures (`useMutation`) sans bibliothèque de cache : l'hôte garde la sienne.
- **Adaptateur mémoire** (`@le-socle/sdk/app/demo`) : objets « Projet » et « Personne », 16 projets, 6 personnes, source de données complète (filtre, tri, recherche, création, modification, suppression, étiquettes, vues), modes `error` et `empty`, latence réglable.
- **Composants** : `AppShell` (barre latérale sur la primitive `Sidebar`, sélecteur d'organisation, menu utilisateur, volet sous `md`), `PageHeader` (fil d'Ariane, titre, actions à droite, pas de sous-titre), `PageContent`, `ScopeSwitch`, `SearchButton`, `EmptyState`, `ErrorState` (« Réessayer »), `LoadingRows`, `StatBand` (compteurs, mini-barres, segments, entonnoir, jauge), `DataTable` (par `ObjectDef` ou colonnes explicites ; tri, groupes, sélection, ligne active), `FilterBar`, `BulkBar`, `ObjectList`, `RecordDrawerHost` (fiche latérale à pile d'URL), champs (`FieldDisplay`, `FieldEditor`, `EditableField`, `RelationPicker`, `TagPicker`), `Pill`, `UserAvatar`.
- **Tests** : `tests/app-engine.test.mjs` (36 tests : champs, filtres, tri, recherche, regroupement, formats, textes, adaptateur).

## Pas fait

- `RichTextView` / éditeur riche : volontairement non porté (HTML stocké, audit de sécurité d'abord). Un champ `richtext` s'édite dans un `Textarea`, s'affiche en texte brut.
- Timeline, formulaire de création généré, cockpit générique, palette de commandes, notes, tâches, organigramme, `drawer-summary` (blocs), actions de fiche (`record-actions`) : étapes C6, E4 à E8, F4 à F6 du plan.
- Pas d'import de `next/*`. LifeOS n'a pas basculé.

## Écarts avec LifeOS (à garder réglables)

| LifeOS | SDK |
|---|---|
| Montants à 0 décimale | `moneyDigits` : 2 par défaut ; LifeOS passe `0` |
| Gras sur titres de tableau, valeurs de bandeau (`font-medium/semibold`) | Aucun gras hors titres ; valeurs en chiffres tabulaires (`type-figure`) |
| `uppercase` dans la palette | Casse normale |
| 15 teintes en classes de palette Tailwind | 6 tons lus sur les rôles de la marque (`tints.ts`) : chaque teinte d'origine se range dans un ton ; deux teintes voisines (par exemple bleu et indigo) deviennent identiques |
| Sous-titre de page | Supprimé |
| Cases à cocher et lignes à 36/40 px de hauteur libre | Hauteur `--row-single` (suit la densité) |
| Colonnes en pixels (`width` = px) | `FieldDef.width` = poids relatif ; le tableau remplit sa largeur et ne défile pas à 1024 px |
| Édition sur place par popover | Identique ; le déclencheur garde la hauteur de repos |
| Notifications `sonner`, `localStorage`, `next/link`, `/api/rpc` en dur | Injectés (`Notifier`, `KeyValueStore`, `Navigation.Link`, `DataSource`) |
| `ObjectDef.view`, `table`, `tagLink`, `ownerKey`, `column` | Retirés ; à garder dans un type étendu de LifeOS |
