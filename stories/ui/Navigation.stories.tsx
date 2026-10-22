import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingIcon, ChevronsUpDownIcon, HomeIcon, InboxIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '../../src/ui/avatar';
import { Badge } from '../../src/ui/badge';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../src/ui/breadcrumb';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../../src/ui/navigation-menu';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../src/ui/pagination';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from '../../src/ui/sidebar';
import { Matrix, Row } from '../lib/matrix';

const meta: Meta = { title: 'Composants/Navigation', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

export const FilDAriane: Story = {
  name: 'Fil d’Ariane',
  parameters: { pseudo: { hover: ['[data-etat="survol"] a'], focusVisible: ['[data-etat="focus"] a'] } },
  render: () => (
    <Matrix>
      <Row label="Complet">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#accueil">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#comptes">Comptes</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Groupe Horizon</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
      <Row label="Niveaux masqués">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#accueil">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Contrat 2026</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
      <Row label="Survol et focus clavier">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem data-etat="survol"><BreadcrumbLink href="#a">Survol</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem data-etat="focus"><BreadcrumbLink href="#b">Focus</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Page courante</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
    </Matrix>
  ),
};

export const PaginationStory: Story = {
  name: 'Pagination',
  parameters: { pseudo: { hover: ['[data-etat="survol"] a'], focusVisible: ['[data-etat="focus"] a'] } },
  render: () => (
    <Matrix>
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#p1" /></PaginationItem>
          <PaginationItem><PaginationLink href="#p1" aria-label="Page 1">1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#p2" isActive aria-label="Page 2">2</PaginationLink></PaginationItem>
          <PaginationItem data-etat="survol"><PaginationLink href="#p3" aria-label="Page 3">3</PaginationLink></PaginationItem>
          <PaginationItem data-etat="focus"><PaginationLink href="#p4" aria-label="Page 4">4</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem>
          <PaginationItem><PaginationLink href="#p12" aria-label="Page 12">12</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#p3" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </Matrix>
  ),
};

export const MenuDeNavigation: Story = {
  name: 'Menu de navigation',
  render: () => (
    <Matrix>
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem><NavigationMenuLink href="#accueil" data-active="true" className={navigationMenuTriggerStyle()}>Accueil</NavigationMenuLink></NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-1">
                <li><NavigationMenuLink href="#audit"><span className="type-label text-heading">Audit</span><span className="type-caption text-muted-foreground">Un état des lieux en trois semaines.</span></NavigationMenuLink></li>
                <li><NavigationMenuLink href="#suivi"><span className="type-label text-heading">Suivi</span><span className="type-caption text-muted-foreground">Un tableau de bord partagé.</span></NavigationMenuLink></li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem><NavigationMenuLink href="#tarifs" className={navigationMenuTriggerStyle()}>Tarifs</NavigationMenuLink></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Matrix>
  ),
};

function Menu({ collapsible = 'none' as 'none' | 'icon' | 'offcanvas' }) {
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Mon organisation">
              <Avatar size="sm" shape="square"><AvatarFallback><BuildingIcon aria-hidden="true" className="size-4" /></AvatarFallback></Avatar>
              <span>Mon organisation</span>
              <ChevronsUpDownIcon aria-hidden="true" className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Travail</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton isActive tooltip="Accueil" asChild><a href="#accueil"><HomeIcon aria-hidden="true" /><span>Accueil</span></a></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Comptes" asChild><a href="#comptes"><UsersIcon aria-hidden="true" /><span>Comptes</span></a></SidebarMenuButton>
                <SidebarMenuBadge>128</SidebarMenuBadge>
                <SidebarMenuSub>
                  <SidebarMenuSubItem><SidebarMenuSubButton href="#actifs">Actifs</SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton href="#prospects">Prospects</SidebarMenuSubButton></SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton tooltip="Boîte de réception" asChild><a href="#inbox"><InboxIcon aria-hidden="true" /><span>Boîte de réception</span></a></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton tooltip="Archives" disabled><SettingsIcon aria-hidden="true" /><span>Archives</span></SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Marie Lambert">
              <Avatar size="sm"><AvatarFallback>ML</AvatarFallback></Avatar>
              <span>Marie Lambert</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {collapsible === 'none' ? null : null}
    </>
  );
}

/** La barre latérale dans un cadre d'application : ouverte, puis repliée en icônes. */
function Shell({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="mx__shell" data-collapsed={collapsed ? '' : undefined}>
      <SidebarProvider defaultOpen={!collapsed} className="min-h-0 h-full">
        <Sidebar collapsible="icon" className="absolute! h-full!">
          <Menu />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-control-lg items-center gap-2 border-b border-border px-3">
            <SidebarTrigger />
            <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Accueil</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
            <Badge className="ml-auto" variant="info">3 nouveautés</Badge>
          </header>
          <div className="p-4 type-body-sm text-foreground">Contenu de la page.</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const BarreLaterale: Story = {
  name: 'Barre latérale',
  render: () => (
    <Matrix cols={1}>
      <Shell />
      <Shell collapsed />
    </Matrix>
  ),
};
