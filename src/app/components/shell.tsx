'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon, LogOutIcon, SearchIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../../ui/sidebar';
import type { AppOrg, AppSession, IconComponent, Navigation } from '../engine/contracts';
import { useAppMessages, useNavigation, useSession } from '../engine/provider';
import { Icon } from './icons';
import { UserAvatar } from './user-avatar';

export interface NavItem {
  href: string;
  label: string;
  /** Nom d'icône du jeu d'icônes de l'application, ou composant. */
  icon?: string | IconComponent;
  /** Compteur affiché à droite (éléments en attente). */
  badge?: number;
}

export interface NavGroup {
  /** Titre du groupe ; absent pour le groupe principal. */
  label?: string;
  items: NavItem[];
}

type LinkComponent = Navigation['Link'];

const PlainLink: LinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon }: { icon: NavItem['icon'] }) {
  if (!icon) return null;
  if (typeof icon === 'string') return <Icon name={icon} />;
  const C = icon;
  return <C />;
}

/** Pastille d'organisation : initiale sur un fond d'accent. */
function OrgMark({ org, size = 'md' }: { org: AppOrg; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'type-label flex shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
        size === 'md' ? 'size-8' : 'size-6',
      )}
    >
      {org.initial ?? org.name.charAt(0)}
    </span>
  );
}

/** Sélecteur d'organisation : l'organisation courante et la liste des autres. */
export function OrgSwitcher({ session }: { session: AppSession }) {
  const m = useAppMessages();
  const current = session.orgs.find((o) => o.id === session.orgId) ?? session.orgs[0];
  if (!current) return null;
  const canSwitch = session.orgs.length > 1 && !!session.onSwitchOrg;
  const label = (
    <>
      <OrgMark org={current} />
      <span className="min-w-0 flex-1 text-left">
        <span className="type-label block truncate" data-testid="current-org">
          {current.name}
        </span>
        {session.roleLabel ? <span className="type-caption block truncate text-sidebar-foreground">{session.roleLabel}</span> : null}
      </span>
      {canSwitch ? <ChevronsUpDownIcon className="size-4 shrink-0 text-sidebar-foreground" aria-hidden="true" /> : null}
    </>
  );
  const cls = 'focus-ring-inset flex w-full items-center gap-2 rounded-md p-1.5 text-sidebar-accent-foreground transition-colors duration-fast';
  if (!canSwitch) return <div className={cls}>{label}</div>;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title={m.shell.switchOrganization} className={cn(cls, 'hover:bg-sidebar-accent')}>
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>{m.shell.organizations}</DropdownMenuLabel>
        {session.orgs.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => o.id !== session.orgId && session.onSwitchOrg?.(o.id)} className="gap-2">
            <OrgMark org={o} size="sm" />
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === session.orgId ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ session }: { session: AppSession }) {
  const m = useAppMessages();
  const body = (
    <>
      <UserAvatar name={session.user.name} className="size-7" />
      <span className="min-w-0 flex-1 text-left">
        <span className="type-body-sm block truncate text-sidebar-accent-foreground">{session.user.name}</span>
        {session.user.email ? <span className="type-caption block truncate text-sidebar-foreground">{session.user.email}</span> : null}
      </span>
    </>
  );
  const cls = 'focus-ring-inset flex w-full items-center gap-2 rounded-md p-1.5';
  if (!session.onSignOut) return <div className={cls}>{body}</div>;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title={m.shell.userMenu} className={cn(cls, 'hover:bg-sidebar-accent')}>
          {body}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuSeparator className="hidden" />
        <DropdownMenuItem onSelect={() => void session.onSignOut?.()}>
          <LogOutIcon aria-hidden="true" /> {m.shell.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface AppShellProps {
  groups: NavGroup[];
  /** Chemin courant ; défaut : celui de la navigation du moteur. */
  pathname?: string;
  /** Lien de l'application ; défaut : celui de la navigation du moteur, sinon un `<a>`. */
  Link?: LinkComponent;
  /** Session ; défaut : celle du moteur. Absente : ni organisation ni utilisateur. */
  session?: AppSession | null;
  /** Logo ou marque, au-dessus du sélecteur d'organisation. */
  brand?: React.ReactNode;
  /** Pied de barre (réglages), au-dessus du menu utilisateur. */
  footerItems?: NavItem[];
  /** Barre latérale repliée au départ. */
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Coque d'application : barre latérale (organisation, groupes de navigation, utilisateur) et zone de
 * contenu. Sous le point de rupture `md`, la barre devient un volet ouvert par le bouton de la barre
 * du haut. La navigation est fournie en données : la coque ne connaît aucune route.
 */
export function AppShell({ groups, pathname, Link, session, brand, footerItems, defaultOpen = true, children }: AppShellProps) {
  const m = useAppMessages();
  const nav = useNavigation();
  const engineSession = useSession();
  const sess = session === undefined ? engineSession : session;
  const path = pathname ?? nav?.pathname ?? '';
  const L = Link ?? nav?.Link ?? PlainLink;
  const org = sess?.orgs.find((o) => o.id === sess.orgId) ?? sess?.orgs[0];

  const item = (n: NavItem) => (
    <SidebarMenuItem key={n.href}>
      <SidebarMenuButton asChild isActive={isActive(path, n.href)}>
        <L href={n.href}>
          <NavIcon icon={n.icon} />
          <span>{n.label}</span>
        </L>
      </SidebarMenuButton>
      {n.badge ? <SidebarMenuBadge aria-label={`${n.badge}`}>{n.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          {brand}
          {sess ? <OrgSwitcher session={sess} /> : null}
        </SidebarHeader>
        <SidebarContent>
          {groups.map((g, i) => (
            <SidebarGroup key={g.label ?? `g${i}`}>
              {g.label ? <SidebarGroupLabel>{g.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu aria-label={g.label ?? m.shell.navigation}>{g.items.map(item)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          {footerItems?.length ? <SidebarMenu>{footerItems.map(item)}</SidebarMenu> : null}
          {sess ? <UserMenu session={sess} /> : null}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="sticky top-0 z-layer-sticky flex h-12 items-center gap-2 border-b border-divider bg-background px-3 md:hidden">
          <SidebarTrigger label={m.shell.openNavigation} />
          {org ? (
            <>
              <OrgMark org={org} size="sm" />
              <span className="type-label truncate text-heading">{org.name}</span>
            </>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * En-tête de page : fil d'Ariane facultatif au-dessus, titre à gauche (le seul gras de la page),
 * actions à droite. Pas de sous-titre explicatif.
 */
export function PageHeader({
  title,
  breadcrumb,
  actions,
  Link,
  className,
}: {
  title: string;
  breadcrumb?: Crumb[];
  actions?: React.ReactNode;
  Link?: LinkComponent;
  className?: string;
}) {
  const nav = useNavigation();
  const L = Link ?? nav?.Link ?? PlainLink;
  return (
    <header data-slot="page-header" className={cn('flex flex-col gap-2 px-4 pt-5 pb-4 md:px-6', className)}>
      {breadcrumb?.length ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((c, i) => {
              const last = i === breadcrumb.length - 1;
              return (
                <React.Fragment key={`${c.label}-${i}`}>
                  <BreadcrumbItem>
                    {last || !c.href ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <L href={c.href}>{c.label}</L>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {last ? null : <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="type-title min-w-0 flex-1 truncate text-heading">{title}</h1>
        {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

/** Zone de contenu d'une page : marges latérales alignées sur l'en-tête, espacement vertical régulier. */
export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-slot="page-content" className={cn('flex min-w-0 flex-1 flex-col gap-4 px-4 pb-8 md:px-6', className)}>{children}</div>;
}

/** Bouton de recherche de l'en-tête (ouvre la palette de commandes de l'application). */
export function SearchButton({ onClick, shortcut }: { onClick: () => void; shortcut?: string }) {
  const m = useAppMessages();
  return (
    <Button variant="neutral" size="md" onClick={onClick} className="text-muted-foreground sm:w-52 sm:justify-start">
      <SearchIcon />
      <span className="sr-only sm:not-sr-only">{m.shell.searchPlaceholder}</span>
      {shortcut ? <kbd className="type-caption ml-auto hidden rounded-detail border border-border bg-muted px-1.5 sm:inline">{shortcut}</kbd> : null}
    </Button>
  );
}

/** Sélecteur de périmètre (« Moi / Tout le monde ») : un groupe de boutons radio. */
export function ScopeSwitch({ scope, onChange, label }: { scope: { value: string; options: { value: string; label: string }[] }; onChange: (v: string) => void; label?: string }) {
  const m = useAppMessages();
  return (
    <div role="radiogroup" aria-label={label ?? m.shell.scope} className="inline-flex shrink-0 rounded-md border border-border bg-background p-0.5">
      {scope.options.map((o) => {
        const on = o.value === scope.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => !on && onChange(o.value)}
            className={cn(
              'focus-ring type-label-sm h-control-sm rounded-detail px-3 whitespace-nowrap transition-colors duration-micro',
              on ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
