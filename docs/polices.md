# Polices

Une marque déclare ses familles dans `fonts.json`. Le SDK ne charge jamais une police depuis un service tiers : les fichiers (woff2) sont dans le dépôt de la marque, la licence est à côté, l'application les sert.

## Format de `fonts.json`

```json
{
  "families": [
    {
      "family": "Inter Variable",
      "role": "text",
      "license": { "name": "SIL Open Font License 1.1", "file": "inter/OFL.txt" },
      "faces": [{ "file": "inter/inter-latin-wght-normal.woff2", "weight": "100 900", "style": "normal", "unicodeRange": "U+0000-00FF" }],
      "fallbacks": { "web": "…", "email": "…", "powerpoint": "…", "pdf": "…" }
    }
  ]
}
```

`role` : `heading`, `text`, `figure` ou `code`. Le build échoue si la licence, un fichier ou un repli manque, ou si un fichier est une URL distante (`scripts/lib/fonts.mjs`). Les familles sont ensuite liées à la marque par `value.font.family.*` dans `tokens.json`.

## Replis par support (thème neutre)

| Support | Police | Pourquoi |
|---|---|---|
| Web | Inter Variable (woff2 auto-hébergé), puis `system-ui`, `-apple-system`, Segoe UI, Roboto, Arial | les polices du web sont servies par l'application |
| E-mail | Arial, Helvetica, sans-serif | les messageries ignorent les polices du web |
| PowerPoint | Arial | installée sur tous les postes Windows et macOS |
| PDF | Inter Variable intégrée au PDF (sous-ensemble) | le navigateur de rendu l'embarque ; à vérifier avec `pdffonts` quand le rendu existera (lot 5) |

Les replis de la marque de démonstration sont dans `brands/demo/fonts.json`.

## Fichiers du neutre

Inter (variable, sous-ensembles latin et latin étendu), licence SIL OFL 1.1, copie des fichiers du paquet `@fontsource-variable/inter` 5.3.0. La marque de démonstration embarque Fraunces et Space Grotesk, même licence.

## Ce qui n'est pas prouvé aujourd'hui

« Un PDF généré contient ses polices » demande le rendu en PDF (lot 5) : non vérifié ici.
