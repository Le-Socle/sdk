// Registre des marques de Storybook. Une marque est une feuille CSS qui passe après celle du SDK ;
// le neutre n'a pas de feuille. Une marque du dépôt (brands/<id>) s'ajoute ici, sur une ligne.
import demoCss from '../../generated/brands/demo/brand.css?inline';
import demoFonts from '../../generated/brands/demo/fonts.css?inline';

export const BRANDS: Record<string, { title: string; css: string }> = {
  neutral: { title: 'Neutre', css: '' },
  demo: { title: 'Démonstration', css: `${demoFonts}\n${demoCss.replace(/@import\s+["']\.\/fonts\.css["'];?/, '')}` },
};

export const brandItems = Object.entries(BRANDS).map(([value, b]) => ({ value, title: b.title }));

const STYLE_ID = 'sdk-brand-sheet';

/** Pose la marque (feuille après celle du SDK), le thème et la densité sur le document. */
export function applyContext({ brand, theme, density }: { brand: string; theme: string; density: string }) {
  const root = document.documentElement;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  const css = BRANDS[brand]?.css ?? '';
  if (style.textContent !== css) style.textContent = css;
  root.dataset.brand = brand;
  if (theme === 'dark') root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  if (density === 'comfortable') root.dataset.density = 'comfortable';
  else delete root.dataset.density;
}
