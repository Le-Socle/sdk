import type { Meta, StoryObj } from '@storybook/react-vite';
import { InboxIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../src/ui/accordion';
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '../../src/ui/avatar';
import { Badge } from '../../src/ui/badge';
import { Button } from '../../src/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../src/ui/card';
import { Separator } from '../../src/ui/separator';
import { Skeleton, SkeletonGroup } from '../../src/ui/skeleton';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../src/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/ui/tabs';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta = { title: 'Composants/Surfaces et données', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

export const Cartes: Story = {
  render: () => (
    <Matrix>
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Rapport trimestriel</CardTitle>
          <CardDescription>Mis à jour hier par Marie Lambert.</CardDescription>
        </CardHeader>
        <CardContent>12 480,00 € facturés sur 3 projets.</CardContent>
        <CardFooter><Button size="sm">Ouvrir</Button><Button size="sm" variant="neutral">Archiver</Button></CardFooter>
      </Card>
      <Card framed={false} className="w-80">
        <CardHeader><CardTitle>Sans cadre</CardTitle></CardHeader>
        <CardContent>Pour une section qui n’a pas besoin de surface.</CardContent>
      </Card>
    </Matrix>
  ),
};

export const Badges: Story = {
  render: () => (
    <Matrix>
      <Row label="Variantes">
        <Badge>Neutre</Badge>
        <Badge variant="info">Information</Badge>
        <Badge variant="success">Réglé</Badge>
        <Badge variant="warning">À relancer</Badge>
        <Badge variant="danger">En retard</Badge>
      </Row>
      <Row label="Dense">
        <Badge size="dense">Neutre</Badge>
        <Badge size="dense" variant="success">Réglé</Badge>
        <Badge size="dense" variant="danger">En retard</Badge>
      </Row>
      <Row label="Avec icône et chiffre">
        <Badge variant="info"><InboxIcon aria-hidden="true" />12 480,00 €</Badge>
      </Row>
    </Matrix>
  ),
};

export const SeparateursEtSquelettes: Story = {
  name: 'Séparateurs et squelettes',
  render: () => (
    <Matrix>
      <div className="flex w-72 flex-col gap-3">
        <span className="type-body-sm">Au-dessus</span>
        <Separator />
        <div className="flex h-6 items-center gap-3"><span className="type-body-sm">Gauche</span><Separator orientation="vertical" /><span className="type-body-sm">Droite</span></div>
      </div>
      <SkeletonGroup className="flex w-72 flex-col gap-3">
        <div className="flex items-center gap-3"><Skeleton shape="round" className="size-10" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></div>
        <Skeleton className="h-24 w-full" />
      </SkeletonGroup>
    </Matrix>
  ),
};

export const Avatars: Story = {
  render: () => (
    <Matrix>
      <Row label="Tailles">
        <Avatar size="sm"><AvatarFallback>ML</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>KB</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>SM</AvatarFallback></Avatar>
        <Avatar shape="square"><AvatarFallback>JP</AvatarFallback></Avatar>
      </Row>
      <Row label="Image absente : les initiales prennent le relais">
        <Avatar><AvatarImage src="data:image/png;base64,AAAA" alt="Marie Lambert" /><AvatarFallback>ML</AvatarFallback></Avatar>
      </Row>
      <Row label="Groupe">
        <AvatarGroup aria-label="Participants">
          <Avatar><AvatarFallback>ML</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>KB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>+4</AvatarFallback></Avatar>
        </AvatarGroup>
      </Row>
    </Matrix>
  ),
};

export const Tableau: Story = {
  render: () => (
    <Matrix cols={1}>
      <Table>
        <TableCaption>Projets en cours, montants hors taxes.</TableCaption>
        <TableHeader>
          <TableRow><TableHead>Projet</TableHead><TableHead>Responsable</TableHead><TableHead className="text-right">Montant</TableHead><TableHead>Statut</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>Rapport trimestriel</TableCell><TableCell>Marie Lambert</TableCell><TableCell className="text-right">12 480,00 €</TableCell><TableCell><Badge variant="success">Réglé</Badge></TableCell></TableRow>
          <TableRow><TableCell>Audit de sécurité</TableCell><TableCell>Karim Benali</TableCell><TableCell className="text-right">8 900,00 €</TableCell><TableCell><Badge variant="warning">À relancer</Badge></TableCell></TableRow>
          <TableRow data-state="selected"><TableCell>Migration des données</TableCell><TableCell>Sophie Martin</TableCell><TableCell className="text-right">23 150,50 €</TableCell><TableCell><Badge variant="danger">En retard</Badge></TableCell></TableRow>
        </TableBody>
        <TableFooter><TableRow><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right">44 530,50 €</TableCell><TableCell /></TableRow></TableFooter>
      </Table>
    </Matrix>
  ),
};

export const Accordeon: Story = {
  render: () => (
    <Matrix>
      <Accordion type="single" collapsible defaultValue="a" className="w-full">
        <AccordionItem value="a"><AccordionTrigger>Comment se déroule l’audit ?</AccordionTrigger><AccordionContent>Un entretien, puis une semaine d’analyse et un rapport de synthèse remis en séance.</AccordionContent></AccordionItem>
        <AccordionItem value="b"><AccordionTrigger>Quel est le délai ?</AccordionTrigger><AccordionContent>Trois semaines à partir de la signature.</AccordionContent></AccordionItem>
        <AccordionItem value="c"><AccordionTrigger disabled>Section indisponible</AccordionTrigger><AccordionContent>—</AccordionContent></AccordionItem>
      </Accordion>
    </Matrix>
  ),
};

export const Onglets: Story = {
  render: () => (
    <Matrix>
      <Tabs defaultValue="resume" className="w-full">
        <TabsList aria-label="Sections">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="echanges">Échanges</TabsTrigger>
          <TabsTrigger value="notes" disabled>Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" tabIndex={-1}>Synthèse du compte.</TabsContent>
        <TabsContent value="echanges" tabIndex={-1}>Quatre échanges ce trimestre.</TabsContent>
      </Tabs>
      <Tabs defaultValue="resume" className="w-full">
        <TabsList variant="pill" aria-label="Vues">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="echanges">Échanges</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" tabIndex={-1}>Forme pastille.</TabsContent>
      </Tabs>
    </Matrix>
  ),
};
