# Correspondance des jetons : ancien nom → nouveau nom

Source : apoleos-design-system tokens/tokens.css, branche main (0.4.0 + landing v3). Fichier généré depuis `docs/correspondance-jetons.json` par `node scripts/check-mapping.mjs --write`.

La marque APOLEOS s'en sert pour réécrire ses jetons dans son propre paquet. 246 variables d'origine : 143 identiques, 69 renommées, 32 fusionnées dans l'échelle de données, 2 laissées hors du SDK.

Règles de nommage : une couche par préfixe. Valeurs : `--palette-*`, `--font-*`, `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*`, `--space-*`, `--ease-*`, `--duration-*`. Rôles : `--color-*`, `--type-*`, `--radius-*`, `--shadow-*`, `--control-*`, `--row-*`, `--layer-*`, `--container-*`, `--breakpoint-*`, `--data-*`. Composants : `--background`, `--primary`… (vocabulaire shadcn/ui) et `--<composant>-<partie>` (`--button-primary-bg`…). Aucune teinte de marque dans un nom : le bleu de Prusse devient `primary`, le Black Cherry `accent`, le Noyer `secondary`, le gris bleuté `neutral`.

| Ancien nom | Nouveau nom | Statut | Note |
|---|---|---|---|
| `--border-width-thick` | `--border-width-thick` | identique |  |
| `--border-width-thin` | `--border-width-thin` | identique |  |
| `--color-accent` | `--color-accent-base` | renommé |  |
| `--color-accent-ink` | `--color-accent-ink` | identique |  |
| `--color-accent-secondary` | `--color-accent-secondary` | identique |  |
| `--color-accent-subtle` | `--color-accent-subtle` | identique |  |
| `--color-action` | `--color-action-base` | renommé |  |
| `--color-action-hover` | `--color-action-hover` | identique |  |
| `--color-action-inverse` | `--color-action-inverse` | identique |  |
| `--color-action-inverse-hover` | `--color-action-inverse-hover` | identique |  |
| `--color-action-inverse-text` | `--color-action-inverse-text` | identique |  |
| `--color-action-text` | `--color-action-text` | identique |  |
| `--color-bg` | `--color-bg-page` | renommé |  |
| `--color-bg-dark` | `--color-bg-inverse` | renommé |  |
| `--color-bg-darker` | `--color-bg-inverse-deep` | renommé |  |
| `--color-bg-raised` | `--color-bg-raised` | identique |  |
| `--color-bg-surface` | `--color-bg-surface` | identique |  |
| `--color-border` | `--color-border-base` | renommé |  |
| `--color-border-strong` | `--color-border-strong` | identique |  |
| `--color-border-subtle` | `--color-border-subtle` | identique |  |
| `--color-error` | `--color-status-error` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-error-bg` | `--color-status-error-bg` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-error-border` | `--color-status-error-border` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-error-text` | `--color-status-error-text` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-field-blush` | `--color-field-accent-soft` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-blush-line` | `--color-field-accent-soft-line` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-cherry` | `--color-field-accent` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-cherry-line` | `--color-field-accent-line` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-prusse` | `--color-field-strong` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-prusse-line` | `--color-field-strong-line` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-sky` | `--color-field-soft` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-field-sky-line` | `--color-field-soft-line` | renommé | Aplat de tuile de profil : le nom de couleur de marque devient un rôle. |
| `--color-focus` | `--color-focus-base` | renommé |  |
| `--color-focus-inverse` | `--color-focus-inverse` | identique |  |
| `--color-info` | `--color-status-info` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-info-bg` | `--color-status-info-bg` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-info-border` | `--color-status-info-border` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-info-text` | `--color-status-info-text` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-level-correct` | `--color-data-2-mark` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-correct-bg` | `--color-data-2-bg` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-correct-border` | `--color-data-2-border` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-correct-text` | `--color-data-2-text` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-critical` | `--color-data-4-mark` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-critical-bg` | `--color-data-4-bg` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-critical-border` | `--color-data-4-border` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-critical-text` | `--color-data-4-text` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-fragile` | `--color-data-3-mark` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-fragile-bg` | `--color-data-3-bg` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-fragile-border` | `--color-data-3-border` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-fragile-text` | `--color-data-3-text` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-solid` | `--color-data-1-mark` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-solid-bg` | `--color-data-1-bg` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-solid-border` | `--color-data-1-border` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-level-solid-text` | `--color-data-1-text` | fusionné | L'niveaux de performance et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-overlay` | `--color-overlay` | identique |  |
| `--color-primary` | `--color-brand-base` | renommé |  |
| `--color-primary-dark` | `--color-brand-dark` | renommé |  |
| `--color-primary-light` | `--color-brand-light` | renommé |  |
| `--color-primary-mid` | `--color-brand-mid` | renommé |  |
| `--color-primary-subtle` | `--color-brand-subtle` | renommé |  |
| `--color-risk-critical` | `--color-data-4-mark` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-critical-bg` | `--color-data-4-bg` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-critical-border` | `--color-data-4-border` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-critical-text` | `--color-data-4-text` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 4) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-high` | `--color-data-3-mark` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-high-bg` | `--color-data-3-bg` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-high-border` | `--color-data-3-border` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-high-text` | `--color-data-3-text` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 3) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-low` | `--color-data-1-mark` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-low-bg` | `--color-data-1-bg` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-low-border` | `--color-data-1-border` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-low-text` | `--color-data-1-text` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 1) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-medium` | `--color-data-2-mark` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-medium-bg` | `--color-data-2-bg` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-medium-border` | `--color-data-2-border` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-risk-medium-text` | `--color-data-2-text` | fusionné | L'échelle de risque et ses alias deviennent l'échelle de données à paliers (palier 2) ; le palier 1 est le plus favorable. Le libellé du palier est celui du composant ou de la marque. |
| `--color-scrim` | `--color-scrim` | identique |  |
| `--color-sidebar-active` | `--color-sidebar-active` | identique |  |
| `--color-sidebar-bg` | `--color-sidebar-bg` | identique |  |
| `--color-sidebar-divider` | `--color-sidebar-divider` | identique |  |
| `--color-sidebar-focus` | `--color-sidebar-focus` | identique |  |
| `--color-sidebar-hover` | `--color-sidebar-hover` | identique |  |
| `--color-sidebar-text` | `--color-sidebar-text` | identique |  |
| `--color-sidebar-text-dim` | `--color-sidebar-text-dim` | identique |  |
| `--color-success` | `--color-status-success` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-success-bg` | `--color-status-success-bg` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-success-border` | `--color-status-success-border` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-success-text` | `--color-status-success-text` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-text-heading` | `--color-text-heading` | identique |  |
| `--color-text-inverse` | `--color-text-inverse` | identique |  |
| `--color-text-inverse-dim` | `--color-text-inverse-dim` | identique |  |
| `--color-text-primary` | `--color-text-primary` | identique |  |
| `--color-text-secondary` | `--color-text-secondary` | identique |  |
| `--color-text-tertiary` | `--color-text-tertiary` | identique |  |
| `--color-warning` | `--color-status-warning` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-warning-bg` | `--color-status-warning-bg` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-warning-border` | `--color-status-warning-border` | renommé | Statuts : alias d'état, rangés sous status. |
| `--color-warning-text` | `--color-status-warning-text` | renommé | Statuts : alias d'état, rangés sous status. |
| `--container-page` | `--container-page` | identique |  |
| `--container-prose` | `--container-prose` | identique |  |
| `--control-lg` | `--control-lg` | identique |  |
| `--control-md` | `--control-md` | identique |  |
| `--control-sm` | `--control-sm` | identique |  |
| `--control-touch` | `--control-touch` | identique |  |
| `--duration-fast` | `--duration-fast` | identique |  |
| `--duration-micro` | `--duration-micro` | identique |  |
| `--duration-normal` | `--duration-normal` | identique |  |
| `--duration-slow` | `--duration-slow` | identique |  |
| `--duration-slower` | `--duration-slower` | identique |  |
| `--ease-in` | `--ease-in` | identique |  |
| `--ease-in-out` | `--ease-in-out` | identique |  |
| `--ease-out` | `--ease-out` | identique |  |
| `--focus-ring-offset` | `--focus-ring-offset` | identique |  |
| `--focus-ring-width` | `--focus-ring-width` | identique |  |
| `--font-headline` | `--font-heading` | renommé | Famille des titres. |
| `--font-text` | `--font-text` | identique |  |
| `--layer-dialog` | `--layer-dialog` | identique |  |
| `--layer-menu` | `--layer-menu` | identique |  |
| `--layer-sheet` | `--layer-sheet` | identique |  |
| `--layer-sticky` | `--layer-sticky` | identique |  |
| `--layer-toast` | `--layer-toast` | identique |  |
| `--layer-tooltip` | `--layer-tooltip` | identique |  |
| `--leading-heading` | `--leading-heading` | identique |  |
| `--leading-none` | `--leading-none` | identique |  |
| `--leading-normal` | `--leading-normal` | identique |  |
| `--leading-relaxed` | `--leading-relaxed` | identique |  |
| `--leading-snug` | `--leading-snug` | identique |  |
| `--leading-tight` | `--leading-tight` | identique |  |
| `--numeric-tabular` | `--numeric-tabular` | identique |  |
| `--palette-amber-100` | `--palette-amber-100` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-amber-300` | `--palette-amber-300` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-amber-500` | `--palette-amber-500` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-amber-700` | `--palette-amber-700` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-blue-100` | `--palette-primary-100` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-200` | `--palette-primary-200` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-300` | `--palette-primary-300` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-400` | `--palette-primary-400` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-50` | `--palette-primary-50` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-500` | `--palette-primary-500` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-600` | `--palette-primary-600` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-700` | `--palette-primary-700` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-800` | `--palette-primary-800` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-900` | `--palette-primary-900` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-blue-950` | `--palette-primary-950` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-100` | `--palette-accent-100` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-200` | `--palette-accent-200` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-300` | `--palette-accent-300` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-400` | `--palette-accent-400` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-50` | `--palette-accent-50` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-600` | `--palette-accent-600` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-700` | `--palette-accent-700` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-cherry-800` | `--palette-accent-800` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-green-100` | `--palette-green-100` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-green-300` | `--palette-green-300` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-green-500` | `--palette-green-500` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-green-700` | `--palette-green-700` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-orange-100` | `--palette-orange-100` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-orange-300` | `--palette-orange-300` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-orange-500` | `--palette-orange-500` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-orange-700` | `--palette-orange-700` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-red-100` | `--palette-red-100` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-red-300` | `--palette-red-300` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-red-500` | `--palette-red-500` | identique | Teinte générique de l'échelle d'états ; valeur propre à la marque. |
| `--palette-slate-100` | `--palette-neutral-100` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-150` | `--palette-neutral-150` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-200` | `--palette-neutral-200` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-300` | `--palette-neutral-300` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-400` | `--palette-neutral-400` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-50` | `--palette-neutral-50` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-500` | `--palette-neutral-500` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-550` | `--palette-neutral-550` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-600` | `--palette-neutral-600` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-slate-700` | `--palette-neutral-700` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-walnut-600` | `--palette-secondary-600` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-walnut-700` | `--palette-secondary-700` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-walnut-800` | `--palette-secondary-800` | renommé | Le nom de teinte de marque devient un rôle générique ; la valeur est celle de la marque. |
| `--palette-white` | `--palette-white` | identique |  |
| `--radius-detail` | `--radius-detail` | identique |  |
| `--radius-dot` | `--radius-dot` | identique |  |
| `--radius-frame-round` | — | hors SDK | Rayon propre à la politique de formes de la landing ; reste dans le dépôt de la marque ou de la page qui s'en sert. |
| `--radius-lg` | `--radius-lg` | identique |  |
| `--radius-mark` | `--radius-mark` | identique |  |
| `--radius-md` | `--radius-md` | identique |  |
| `--radius-screen-round` | — | hors SDK | Rayon propre à la politique de formes de la landing ; reste dans le dépôt de la marque ou de la page qui s'en sert. |
| `--radius-sm` | `--radius-sm` | identique |  |
| `--radius-xl` | `--radius-xl` | identique |  |
| `--row-double` | `--row-double` | identique |  |
| `--row-single` | `--row-single` | identique |  |
| `--shadow-1` | `--shadow-1` | identique |  |
| `--shadow-2` | `--shadow-2` | identique |  |
| `--shadow-3` | `--shadow-3` | identique |  |
| `--space-0` | `--space-0` | identique |  |
| `--space-1` | `--space-1` | identique |  |
| `--space-10` | `--space-10` | identique |  |
| `--space-12` | `--space-12` | identique |  |
| `--space-16` | `--space-16` | identique |  |
| `--space-2` | `--space-2` | identique |  |
| `--space-20` | `--space-20` | identique |  |
| `--space-24` | `--space-24` | identique |  |
| `--space-3` | `--space-3` | identique |  |
| `--space-32` | `--space-32` | identique |  |
| `--space-4` | `--space-4` | identique |  |
| `--space-5` | `--space-5` | identique |  |
| `--space-6` | `--space-6` | identique |  |
| `--space-8` | `--space-8` | identique |  |
| `--space-slide-margin` | `--space-slide-margin` | identique |  |
| `--stagger` | `--stagger` | identique |  |
| `--text-2xl` | `--text-2xl` | identique |  |
| `--text-2xs` | `--text-2xs` | identique |  |
| `--text-base` | `--text-base` | identique |  |
| `--text-caption` | `--text-caption` | identique |  |
| `--text-display` | `--text-display` | identique |  |
| `--text-lg` | `--text-lg` | identique |  |
| `--text-sm` | `--text-sm` | identique |  |
| `--text-xl` | `--text-xl` | identique |  |
| `--text-xs` | `--text-xs` | identique |  |
| `--tracking-caps` | `--tracking-caps` | identique |  |
| `--tracking-caps-wide` | `--tracking-caps-wide` | identique |  |
| `--tracking-heading` | `--tracking-heading` | identique |  |
| `--tracking-normal` | `--tracking-normal` | identique |  |
| `--tracking-snug` | `--tracking-snug` | identique |  |
| `--tracking-tight` | `--tracking-tight` | identique |  |
| `--type-body` | `--type-body` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-body-sm` | `--type-body-sm` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-caption` | `--type-caption` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-display` | `--type-display` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-display-tracking` | `--type-display-tracking` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-figure` | `--type-figure` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-figure-sm` | `--type-figure-sm` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-heading` | `--type-heading` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-label` | `--type-label` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-label-caps` | `--type-label-caps` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-label-caps-tracking` | `--type-label-caps-tracking` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-label-lg` | `--type-label-lg` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-label-sm` | `--type-label-sm` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-lede` | `--type-lede` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-overline` | `--type-overline` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-overline-tracking` | `--type-overline-tracking` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-subtitle` | `--type-subtitle` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-subtitle-tracking` | `--type-subtitle-tracking` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-title` | `--type-title` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--type-title-tracking` | `--type-title-tracking` | identique | Les rôles typographiques gardent leur nom ; chacun gagne quatre jetons (-weight, -size, -leading, -family) dont l'abrégé `font` est dérivé. |
| `--weight-light` | `--weight-light` | identique |  |
| `--weight-medium` | `--weight-medium` | identique |  |
| `--weight-regular` | `--weight-regular` | identique |  |
| `--weight-semibold` | `--weight-semibold` | identique |  |

## Jetons nouveaux (sans équivalent dans tokens.css d'origine)

- Échelle de données : `--data-count`, `--data-threshold-1…5` (nombre de paliers et seuils, fixés par la marque).
- Rôles : `--color-text-link`, `--color-border-inverse`, `--color-bg-inverse-raised`, `--color-series-1…6` (séries de graphique), `--color-data-4…6-*` (paliers 5 et 6 de l'échelle).
- Polices : `--font-figure` (chiffres, tabulaires), `--font-code`.
- Points de rupture : `--breakpoint-sm|md|lg|xl` (étaient des littéraux de `theme.css`).
- Couche des composants : tout le vocabulaire shadcn/ui (`--background`, `--primary`…, ancien `bridge.css`) et les jetons `--button-*`, `--input-*`, `--card-*`, `--badge-*`.
- Rôles typographiques : `--type-<rôle>-weight|size|leading|family` (quatre jetons par rôle), l'abrégé `--type-<rôle>` en est dérivé.

## Ce qui n'entre pas

Les dimensions propres à une page de la landing APOLEOS (une trentaine de `--size-*`) et les rayons de la politique de formes B (`--radius-frame-round`, `--radius-screen-round`) restent dans le dépôt qui s'en sert. Le mot « Prusse », « Black Cherry », « Noyer » et les hex de la charte vivent dans le paquet de la marque.
