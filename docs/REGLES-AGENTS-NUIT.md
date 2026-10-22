# Règles communes des agents (chantier SDK, nuit du 22/10/2026)

Lire aussi `docs/PLAN.md` et les issues GitHub citées dans la mission (`gh issue view N -R Le-Socle/sdk`).

## Dépôts
- SDK : `~/projects/le-socle-sdk` (Le-Socle/sdk), branche `main`. Tu commites en local sur `main`, par petits commits lisibles en français (`Lot 1 · jetons : …`). **Jamais de `git push`** : l'orchestrateur relit puis pousse.
- Identité git déjà configurée dans le dépôt. Ne pas la changer.
- Sources en LECTURE SEULE (ne rien y écrire, ne rien y commiter) : `~/projects/apoleos-design-system-git` (design system APOLEOS, main), `~/projects/lifeos` (LifeOS, `app/`), `~/projects/efficiency-control-tower-frontend` (Control Tower legacy).
- Aucune valeur de marque dans le SDK (pas de « prusse », « cherry », « walnut », « apoleos », pas de hex de la charte APOLEOS). La marque APOLEOS vivra dans son propre paquet.

## Machine (devbox partagée, 32 Go)
- Jamais de serveur lancé à la main (`storybook dev`, `vite`, `next dev`). Pour voir Storybook : `npm run build-storybook` puis servir `storybook-static` par un script Playwright (`file://` ou `npx http-server` sous `terminal(background=true)` arrêté à la fin) ; ou demander à l'orchestrateur un `devbox-app`.
- Commande lourde (install, tsc, build, tests, storybook build) : `systemd-run --user --scope --slice=claude.slice -p MemoryMax=3G -p CPUQuota=200% -q env PATH=/home/constantin/.nvm/versions/node/v22.23.3/bin:$PATH NODE_OPTIONS=--max-old-space-size=2048 <cmd>`. Vérifier `free -g` avant : garder ≥ 6 Go disponibles.
- Tests : `--maxWorkers=2`.
- Ne pas mettre `| tail` après un build : rediriger vers un log puis `echo RC=$?`.

## Commandes interdites (personne ne peut les approuver : tu resterais bloqué)
`rm`, heredoc (`<<EOF`), `pkill`, `docker restart`, `git push`, `bash -lc`. Pour créer un fichier : l'outil write_file. Pour supprimer : `git rm` sur un fichier suivi, ou laisser et le signaler. Processus long : `terminal(background=true)`, jamais `&`.

## Qualité
- Pile : React 19, TypeScript strict, Tailwind 4, shadcn/ui, Storybook 10, recharts. Reprendre les versions de `apoleos-design-system-git/package.json`.
- Une pièce = une story. Textes visibles en français, traduisibles (pas de texte en dur non surchargeable dans un composant).
- Aucune couleur ou valeur écrite en dur hors des fichiers de jetons.
- Preuve visuelle : toute pièce visible est capturée (Playwright headless, 1440 px et une largeur étroite) et tu REGARDES les captures (outil vision) avant de dire « fini ». Captures rangées dans `~/.hermes/cache/scratch/sdk-ct/captures/<lot>/`, pas dans le dépôt.
- Règles d'interface de Constantin : gras réservé aux titres ; pas de police à chasse fixe pour les chiffres (chiffres tabulaires) ; actions en haut à droite ; pas de sous-titre explicatif ; pas de défilement horizontal à 1024 px ; arrondis ; casse normale (pas de majuscules forcées) ; montants en € à 2 décimales.

## Rapport final (ta réponse)
1. Fait / pas fait, issue par issue, avec critères d'acceptation cochés ou non et pourquoi.
2. Liste des commits (`git log --oneline`).
3. Commandes de contrôle lancées et leur résultat réel (code retour).
4. Chemins des captures regardées et ce que tu y as vu.
5. Points à trancher par Constantin ou Yoni, et défauts connus.
Ne prétends jamais avoir vérifié ce que tu n'as pas exécuté.
