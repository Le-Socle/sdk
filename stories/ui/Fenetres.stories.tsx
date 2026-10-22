import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { CalendarIcon, CopyIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../src/ui/alert-dialog';
import { Button } from '../../src/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../../src/ui/command';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../src/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../src/ui/dropdown-menu';
import { Field, FieldLabel } from '../../src/ui/field';
import { Input } from '../../src/ui/input';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../../src/ui/popover';
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../../src/ui/sheet';
import { Toaster } from '../../src/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../src/ui/tooltip';
import { MessagesProvider } from '../../src/ui/messages';

const meta: Meta = {
  title: 'Composants/Fenêtres et menus',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/*
 * Les fenêtres flottantes sont rendues dans un portail, hors des cellules : elles lisent les rôles
 * du document. Le thème sombre complet et la densité se changent avec la barre d'outils ; le
 * script de vérification rend chaque story dans les deux thèmes et les deux marques.
 */
const Page = ({ children }: { children: React.ReactNode }) => <div className="mx__single" style={{ minHeight: 'calc(var(--space-12) * 8)' }}>{children}</div>;

export const Dialogue: Story = {
  render: () => (
    <Page>
      <Dialog defaultOpen>
        <DialogTrigger asChild><Button>Nouveau dossier</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>Le dossier sera visible par toute l’équipe.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel htmlFor="dlg-nom" required>Nom</FieldLabel>
              <Input id="dlg-nom" placeholder="Rapport trimestriel" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary">Annuler</Button>
            <Button>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <Page>
      <AlertDialog defaultOpen>
        <AlertDialogTrigger asChild><Button variant="danger">Supprimer</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>Les 3 pièces jointes seront supprimées avec lui. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="danger">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  ),
};

export const Volet: Story = {
  render: () => (
    <Page>
      <Sheet defaultOpen>
        <SheetTrigger asChild><Button>Ouvrir la fiche</Button></SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Marie Lambert</SheetTitle>
            <SheetDescription>Directrice financière, Groupe Horizon.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="type-body-sm">Dernier échange le 14 octobre : demande de devis pour l’audit.</p>
          </SheetBody>
          <SheetFooter>
            <Button variant="secondary">Fermer</Button>
            <Button>Modifier</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Page>
  ),
};

export const FenetreContextuelle: Story = {
  name: 'Fenêtre contextuelle',
  render: () => (
    <Page>
      <Popover defaultOpen>
        <PopoverTrigger asChild><Button variant="neutral"><CalendarIcon aria-hidden="true" />Échéance</Button></PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Échéance</PopoverTitle>
            <PopoverDescription>Le dossier passe en retard le lendemain de cette date.</PopoverDescription>
          </PopoverHeader>
          <Input type="date" aria-label="Date d’échéance" />
        </PopoverContent>
      </Popover>
    </Page>
  ),
};

export const MenuDActions: Story = {
  name: 'Menu d’actions',
  render: () => (
    <Page>
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild><Button variant="neutral">Actions</Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Dossier</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem><PencilIcon aria-hidden="true" />Modifier<DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem><CopyIcon aria-hidden="true" />Dupliquer</DropdownMenuItem>
            <DropdownMenuItem disabled>Archiver</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Suivre ce dossier</DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Statut</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value="ouvert">
                <DropdownMenuRadioItem value="ouvert">Ouvert</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="clos">Clos</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger"><Trash2Icon aria-hidden="true" />Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Page>
  ),
};

export const Infobulle: Story = {
  render: () => (
    <Page>
      <TooltipProvider>
        <Tooltip open>
          <span className="type-body-sm mr-3">Lien de partage</span>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Copier le lien"><CopyIcon aria-hidden="true" /></Button></TooltipTrigger>
          <TooltipContent>Copier le lien</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Page>
  ),
};

export const PaletteDeCommandes: Story = {
  name: 'Palette de commandes',
  render: () => (
    <Page>
      <Command className="h-auto w-96 max-w-full rounded-lg border border-border shadow-2">
        <CommandInput placeholder="Chercher une page ou une action" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Tableau de bord<CommandShortcut>G puis D</CommandShortcut></CommandItem>
            <CommandItem>Comptes<CommandShortcut>G puis C</CommandShortcut></CommandItem>
            <CommandItem checked>Mes dossiers</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>Nouveau compte</CommandItem>
            <CommandItem disabled>Exporter (indisponible)</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Page>
  ),
};

/** Les notifications se déclenchent par un bouton ; la story en ouvre une au chargement. */
export const Notifications: Story = {
  render: () => (
    <Page>
      <Toaster position="bottom-right" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success('Dossier enregistré', { description: '12 480,00 € facturés.' })}>Réussite</Button>
        <Button variant="neutral" onClick={() => toast.error('Échec de l’envoi', { description: 'Réessayez dans un instant.', action: { label: 'Réessayer', onClick: () => {} } })}>Erreur</Button>
        <Button variant="neutral" onClick={() => toast.info('Synchronisation en cours')}>Information</Button>
      </div>
    </Page>
  ),
  play: async () => {
    toast.success('Dossier enregistré', { description: '12 480,00 € facturés.', duration: Infinity });
    toast.error('Échec de l’envoi', { description: 'Réessayez dans un instant.', duration: Infinity, action: { label: 'Réessayer', onClick: () => {} } });
  },
};

/** Textes intégrés remplacés : une application anglaise (ou autre) passe un objet de messages. */
export const TextesTraduits: Story = {
  name: 'Textes intégrés traduits',
  render: () => (
    <Page>
      <MessagesProvider messages={{ close: 'Close', dialogContent: 'Window content' }}>
        <Dialog defaultOpen>
          <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New folder</DialogTitle>
              <DialogDescription>The bouton de fermeture porte « Close » (aria-label), tiré de MessagesProvider.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </MessagesProvider>
    </Page>
  ),
};
