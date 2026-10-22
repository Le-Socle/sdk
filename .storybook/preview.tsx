import type { Decorator, Preview } from '@storybook/react-vite';
import '../generated/css/fonts.css';
import '../generated/css/tokens.css';
import '../stories/lib/docs.css';
import { applyContext, brandItems } from '../stories/lib/brands';

// Le sélecteur de marque, le thème et la densité sont des globales de la barre d'outils : ils
// changent toutes les stories. La marque est une feuille qui passe après celle du SDK ; le thème
// sombre complet et la densité sont des attributs posés sur <html>.
const withContext: Decorator = (Story, context) => {
  const { brand, theme, density } = context.globals as { brand: string; theme: string; density: string };
  applyContext({ brand, theme, density });
  // `key` : la story est remontée quand le contexte change, pour relire les valeurs calculées.
  return (
    <div key={`${brand}-${theme}-${density}`}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withContext],
  initialGlobals: { brand: 'neutral', theme: 'light', density: 'compact' },
  globalTypes: {
    brand: {
      description: 'Marque',
      toolbar: { title: 'Marque', icon: 'paintbrush', dynamicTitle: true, items: brandItems },
    },
    theme: {
      description: 'Thème',
      toolbar: {
        title: 'Thème',
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Clair' },
          { value: 'dark', title: 'Sombre complet' },
        ],
      },
    },
    density: {
      description: 'Densité',
      toolbar: {
        title: 'Densité',
        icon: 'component',
        dynamicTitle: true,
        items: [
          { value: 'compact', title: 'Compacte' },
          { value: 'comfortable', title: 'Confortable' },
        ],
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    options: {
      storySort: {
        order: ['Accueil', 'Documentation', ['Créer une marque', 'Polices'], 'Jetons', ['Palettes', 'Rôles de couleur', 'Échelle de données', 'Typographie', 'Espacements et formes', 'Mouvement', 'Surfaces et thèmes', 'Maquette']],
      },
    },
  },
};

export default preview;
