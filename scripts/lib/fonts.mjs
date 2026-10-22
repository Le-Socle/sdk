// Polices : lit le manifeste d'une marque (ou du thème neutre), contrôle que les fichiers
// et les licences existent, et écrit les @font-face. Aucune URL distante : les polices
// sont auto-hébergées (fichiers woff2 dans le dépôt de la marque), jamais chargées depuis
// un service tiers.
import fs from 'node:fs';
import path from 'node:path';

const SUPPORTS = ['web', 'email', 'powerpoint', 'pdf'];

export function readFonts({ manifestFile, baseDir }) {
  const doc = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const families = doc.families ?? [];
  const files = [];
  const errors = [];
  for (const fam of families) {
    const where = `${manifestFile} (${fam.family})`;
    if (!fam.family || !fam.role) errors.push(`${where} : « family » et « role » sont obligatoires.`);
    if (!fam.license?.name || !fam.license?.file) errors.push(`${where} : la licence (name, file) est obligatoire.`);
    else if (!fs.existsSync(path.join(baseDir, fam.license.file))) errors.push(`${where} : fichier de licence introuvable : ${fam.license.file}`);
    for (const s of SUPPORTS) if (!fam.fallbacks?.[s]) errors.push(`${where} : repli « ${s} » non documenté.`);
    for (const face of fam.faces ?? []) {
      if (/^https?:/i.test(face.file)) errors.push(`${where} : police distante interdite : ${face.file}`);
      const abs = path.join(baseDir, face.file);
      if (!fs.existsSync(abs)) errors.push(`${where} : fichier de police introuvable : ${face.file}`);
      else if (!files.some((f) => f.rel === face.file)) files.push({ rel: face.file, abs });
    }
    if (!fam.faces?.length) errors.push(`${where} : aucune graisse déclarée.`);
  }
  if (errors.length) throw new Error('Polices invalides :\n  ' + errors.join('\n  '));
  const exported = Object.fromEntries(
    families.map((f) => [f.role, { family: f.family, license: f.license.name, fallbacks: f.fallbacks, files: f.faces.map((x) => x.file) }]),
  );
  return { families, files, exported };
}

export function emitFontsCss({ families }, { urlPrefix }) {
  const out = [`/* ============================================================================
   GÉNÉRÉ par scripts/build-tokens.mjs depuis le manifeste de polices. Ne pas éditer.
   Polices auto-hébergées : les fichiers sont servis par l'application, aucun appel
   à un service de polices tiers.
   ============================================================================ */\n`];
  for (const fam of families) {
    out.push(`/* ${fam.family} · licence ${fam.license.name} (${fam.license.file}) */`);
    for (const face of fam.faces) {
      const lines = [
        `  font-family: "${fam.family}";`,
        `  font-style: ${face.style ?? 'normal'};`,
        `  font-weight: ${face.weight ?? '400'};`,
        '  font-display: swap;',
        `  src: url("${urlPrefix}${face.file}") format("woff2");`,
      ];
      if (face.unicodeRange) lines.push(`  unicode-range: ${face.unicodeRange};`);
      out.push(`@font-face {\n${lines.join('\n')}\n}\n`);
    }
  }
  return out.join('\n');
}
