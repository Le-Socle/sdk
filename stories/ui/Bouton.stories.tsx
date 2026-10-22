import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, PlusIcon, SettingsIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../../src/ui/button';
import { Input } from '../../src/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/ui/select';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta<typeof Button> = {
  title: 'Composants/Bouton',
  component: Button,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Button>;

const VARIANTS = ['default', 'secondary', 'outline', 'neutral', 'ghost', 'danger', 'danger-quiet', 'link'] as const;
const LABELS: Record<(typeof VARIANTS)[number], string> = {
  default: 'Principal',
  secondary: 'Secondaire',
  outline: 'Contour',
  neutral: 'Neutre',
  ghost: 'Discret',
  danger: 'Danger',
  'danger-quiet': 'Danger discret',
  link: 'Lien',
};

/** Toutes les variantes au repos, dans les quatre cellules (fond clair et surface sombre × deux densités). */
export const Variantes: Story = {
  render: () => (
    <Matrix>
      <Row label="Variantes">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>{LABELS[v]}</Button>
        ))}
      </Row>
      <Row label="Tailles : sm, md, lg">
        <Button size="sm">Petit</Button>
        <Button size="md">Moyen</Button>
        <Button size="lg">Grand</Button>
      </Row>
      <Row label="Avec icône">
        <Button><PlusIcon aria-hidden="true" />Ajouter</Button>
        <Button variant="secondary">Continuer<ArrowRightIcon aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" aria-label="Réglages"><SettingsIcon aria-hidden="true" /></Button>
        <Button variant="danger" size="icon" aria-label="Supprimer"><Trash2Icon aria-hidden="true" /></Button>
      </Row>
    </Matrix>
  ),
};

/** Repos, survol, focus clavier, appui et désactivé, forcés par l’addon d’états. */
export const Etats: Story = {
  parameters: {
    pseudo: {
      hover: ['[data-etat="survol"] button'],
      focusVisible: ['[data-etat="focus"] button'],
      active: ['[data-etat="appui"] button'],
    },
  },
  render: () => (
    <Matrix>
      {VARIANTS.filter((v) => v !== 'link').map((v) => (
        <Row key={v} label={LABELS[v]}>
          <span data-etat="repos"><Button variant={v}>Repos</Button></span>
          <span data-etat="survol"><Button variant={v}>Survol</Button></span>
          <span data-etat="focus"><Button variant={v}>Focus</Button></span>
          <span data-etat="appui"><Button variant={v}>Appui</Button></span>
          <span data-etat="desactive"><Button variant={v} disabled>Désactivé</Button></span>
        </Row>
      ))}
    </Matrix>
  ),
};

/**
 * Une seule hauteur de contrôle par taille et par densité : bouton, champ et sélecteur alignés sur la
 * même ligne. Le test mesure les trois hauteurs (voir le script de vérification).
 */
export const AlignementDesControles: Story = {
  name: 'Alignement des contrôles',
  render: () => (
    <Matrix>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Row key={size} label={`Taille ${size}`}>
          <div className="flex flex-wrap items-center gap-2" data-aligne={size}>
            <Input size={size} placeholder="Chercher un dossier" aria-label={`Champ ${size}`} className="w-48" />
            <Select defaultValue="tous">
              <SelectTrigger size={size} aria-label={`Sélecteur ${size}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="ouvert">Ouvert</SelectItem>
              </SelectContent>
            </Select>
            <Button size={size}>Filtrer</Button>
            <Button size={size} variant="neutral">Réinitialiser</Button>
          </div>
        </Row>
      ))}
    </Matrix>
  ),
};

export const Defaut: Story = {
  name: 'Un bouton',
  args: { children: 'Enregistrer' },
  render: (args) => (
    <div className="mx__single">
      <Button {...args} />
    </div>
  ),
};
