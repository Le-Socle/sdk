import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon, EuroIcon } from 'lucide-react';
import { Checkbox } from '../../src/ui/checkbox';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../../src/ui/field';
import { Input } from '../../src/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '../../src/ui/input-group';
import { Label } from '../../src/ui/label';
import { RadioGroup, RadioGroupItem } from '../../src/ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../src/ui/select';
import { Switch, SwitchValue } from '../../src/ui/switch';
import { Textarea } from '../../src/ui/textarea';
import { Toggle } from '../../src/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../src/ui/toggle-group';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta = { title: 'Composants/Champs', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

/** Champ : repos, survol, focus clavier, erreur, désactivé. */
export const Champ: Story = {
  parameters: { pseudo: { hover: ['[data-etat="survol"] input'], focusVisible: ['[data-etat="focus"] input'] } },
  render: () => (
    <Matrix>
      <Row label="Repos">
        <span data-etat="repos"><Input placeholder="Nom du dossier" aria-label="Champ au repos" className="w-64" /></span>
      </Row>
      <Row label="Survol">
        <span data-etat="survol"><Input defaultValue="Rapport trimestriel" aria-label="Champ survolé" className="w-64" /></span>
      </Row>
      <Row label="Focus clavier">
        <span data-etat="focus"><Input defaultValue="Rapport trimestriel" aria-label="Champ avec focus" className="w-64" /></span>
      </Row>
      <Row label="Erreur">
        <Input aria-invalid="true" defaultValue="12 480" aria-label="Champ en erreur" className="w-64" />
      </Row>
      <Row label="Désactivé">
        <Input disabled defaultValue="Non modifiable" aria-label="Champ désactivé" className="w-64" />
      </Row>
      <Row label="Zone de texte">
        <Textarea placeholder="Votre message" aria-label="Message" className="w-64" />
      </Row>
    </Matrix>
  ),
};

/** Champ complet : libellé, aide, erreur. */
export const ChampComplet: Story = {
  name: 'Champ complet',
  render: () => (
    <Matrix>
      <FieldGroup className="w-72">
        <Field>
          <FieldLabel htmlFor="mx-nom" required>Nom du dossier</FieldLabel>
          <Input id="mx-nom" placeholder="Rapport trimestriel" />
          <FieldDescription>Visible par toute l’équipe.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="mx-montant">Montant</FieldLabel>
          <Input id="mx-montant" aria-invalid="true" aria-describedby="mx-montant-err" defaultValue="12 480" />
          <FieldError id="mx-montant-err">Saisissez un montant à deux décimales, par exemple 12 480,00 €.</FieldError>
        </Field>
      </FieldGroup>
    </Matrix>
  ),
};

/** Champ composé : icône, texte, bouton accolés. */
export const ChampCompose: Story = {
  name: 'Champ composé',
  parameters: { pseudo: { focusVisible: ['[data-etat="focus"] input'] } },
  render: () => (
    <Matrix>
      <Row label="Recherche">
        <InputGroup className="w-72">
          <InputGroupAddon><SearchIcon aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput placeholder="Chercher un compte" aria-label="Chercher un compte" />
          <InputGroupAddon align="inline-end"><InputGroupButton>Chercher</InputGroupButton></InputGroupAddon>
        </InputGroup>
      </Row>
      <Row label="Montant">
        <InputGroup className="w-72">
          <InputGroupInput defaultValue="12 480,00" aria-label="Montant en euros" className="text-right" />
          <InputGroupAddon align="inline-end"><InputGroupText><EuroIcon aria-hidden="true" />TTC</InputGroupText></InputGroupAddon>
        </InputGroup>
      </Row>
      <Row label="Focus clavier">
        <span data-etat="focus">
          <InputGroup className="w-72">
            <InputGroupInput defaultValue="Rapport" aria-label="Champ composé avec focus" />
          </InputGroup>
        </span>
      </Row>
      <Row label="Erreur">
        <InputGroup className="w-72">
          <InputGroupInput aria-invalid="true" defaultValue="abc" aria-label="Champ composé en erreur" />
        </InputGroup>
      </Row>
      <Row label="Désactivé">
        <InputGroup className="w-72">
          <InputGroupInput disabled defaultValue="Non modifiable" aria-label="Champ composé désactivé" />
        </InputGroup>
      </Row>
    </Matrix>
  ),
};

function Options() {
  return (
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Statut</SelectLabel>
        <SelectItem value="tous">Tous les statuts</SelectItem>
        <SelectItem value="ouvert">Ouvert</SelectItem>
        <SelectItem value="clos" disabled description="Aucun dossier clos cette année">Clos</SelectItem>
      </SelectGroup>
    </SelectContent>
  );
}

/** Sélecteur : repos, erreur, désactivé. */
export const Selecteur: Story = {
  parameters: { pseudo: { hover: ['[data-etat="survol"] button'], focusVisible: ['[data-etat="focus"] button'] } },
  render: () => (
    <Matrix>
      <Row label="Repos"><Select defaultValue="tous"><SelectTrigger className="w-56" aria-label="Statut"><SelectValue /></SelectTrigger><Options /></Select></Row>
      <Row label="Placeholder"><Select><SelectTrigger className="w-56" aria-label="Choisir un statut"><SelectValue placeholder="Choisir un statut" /></SelectTrigger><Options /></Select></Row>
      <Row label="Survol"><span data-etat="survol"><Select defaultValue="ouvert"><SelectTrigger className="w-56" aria-label="Statut survolé"><SelectValue /></SelectTrigger><Options /></Select></span></Row>
      <Row label="Focus clavier"><span data-etat="focus"><Select defaultValue="ouvert"><SelectTrigger className="w-56" aria-label="Statut avec focus"><SelectValue /></SelectTrigger><Options /></Select></span></Row>
      <Row label="Erreur"><Select><SelectTrigger aria-invalid="true" className="w-56" aria-label="Statut en erreur"><SelectValue placeholder="Choisir un statut" /></SelectTrigger><Options /></Select></Row>
      <Row label="Désactivé"><Select defaultValue="tous" disabled><SelectTrigger className="w-56" aria-label="Statut désactivé"><SelectValue /></SelectTrigger><Options /></Select></Row>
    </Matrix>
  ),
};

/** Liste ouverte (dans la page de la story, pas dans une cellule : la liste se pose sur le fond de la barre d’outils). */
export const SelecteurOuvert: Story = {
  name: 'Sélecteur ouvert',
  // Radix masque la page derrière une liste ouverte et laisse le déclencheur focalisable : exemption
  // limitée à la règle axe aria-hidden-focus (voir scripts/verify-stories.mjs).
  tags: ['axe-aria-hidden-ok'],
  render: () => (
    <div className="mx__single" style={{ minHeight: 'calc(var(--space-12) * 6)' }}>
      <Select defaultValue="ouvert" defaultOpen>
        <SelectTrigger className="w-64" aria-label="Statut"><SelectValue /></SelectTrigger>
        <Options />
      </Select>
    </div>
  ),
};

/** Case, bouton radio, interrupteur : coché ou non, désactivé, erreur. */
export const Choix: Story = {
  parameters: { pseudo: { hover: ['[data-etat="survol"] button'], focusVisible: ['[data-etat="focus"] button'] } },
  render: () => (
    <Matrix>
      <Row label="Cases à cocher">
        <div className="flex items-center gap-2"><Checkbox id="c1" /><Label htmlFor="c1">Non cochée</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="c2" defaultChecked /><Label htmlFor="c2">Cochée</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="c3" checked="indeterminate" /><Label htmlFor="c3">Partielle</Label></div>
        <div className="flex items-center gap-2" data-etat="survol"><Checkbox id="c4" /><Label htmlFor="c4">Survol</Label></div>
        <div className="flex items-center gap-2" data-etat="focus"><Checkbox id="c5" /><Label htmlFor="c5">Focus</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="c6" aria-invalid="true" /><Label htmlFor="c6">Erreur</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="c7" disabled /><Label htmlFor="c7">Désactivée</Label></div>
      </Row>
      <Row label="Boutons radio">
        <RadioGroup defaultValue="b" aria-label="Fréquence">
          <div className="flex items-center gap-2"><RadioGroupItem value="a" id="r1" /><Label htmlFor="r1">Chaque jour</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="b" id="r2" /><Label htmlFor="r2">Chaque semaine</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="c" id="r3" disabled /><Label htmlFor="r3">Chaque mois (désactivé)</Label></div>
        </RadioGroup>
      </Row>
      <Row label="Interrupteurs">
        <div className="flex items-center gap-2"><Switch id="s1" aria-label="Alertes" /><Label htmlFor="s1">Désactivé</Label></div>
        <div className="flex items-center gap-2"><Switch id="s2" defaultChecked aria-label="Alertes actives" /><Label htmlFor="s2">Activé</Label></div>
        <div className="flex items-center gap-2"><Switch id="s3" size="sm" defaultChecked aria-label="Alertes petites" /><Label htmlFor="s3">Petit</Label></div>
        <div className="flex items-center gap-2"><Switch id="s4" disabled aria-label="Alertes indisponibles" /><Label htmlFor="s4">Indisponible</Label></div>
        <div className="flex items-center gap-2"><Switch id="s5" defaultChecked aria-label="Notifications" /><SwitchValue on="Activé" off="Désactivé" /></div>
      </Row>
    </Matrix>
  ),
};

/** Bascule et groupe de bascules. */
export const Bascules: Story = {
  render: () => (
    <Matrix>
      <Row label="Bascule">
        <Toggle aria-label="Gras">Gras</Toggle>
        <Toggle aria-label="Actif" defaultPressed>Actif</Toggle>
        <Toggle variant="outline" aria-label="Contour">Contour</Toggle>
        <Toggle disabled aria-label="Indisponible">Indisponible</Toggle>
      </Row>
      <Row label="Groupe, jointes">
        <ToggleGroup type="single" defaultValue="mois" spacing={0} variant="outline" aria-label="Période">
          <ToggleGroupItem value="jour">Jour</ToggleGroupItem>
          <ToggleGroupItem value="mois">Mois</ToggleGroupItem>
          <ToggleGroupItem value="annee">Année</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Row label="Groupe multiple, écartées">
        <ToggleGroup type="multiple" defaultValue={['a']} aria-label="Options">
          <ToggleGroupItem value="a">Compte</ToggleGroupItem>
          <ToggleGroupItem value="b">Contact</ToggleGroupItem>
          <ToggleGroupItem value="c" disabled>Opportunité</ToggleGroupItem>
        </ToggleGroup>
      </Row>
    </Matrix>
  ),
};
