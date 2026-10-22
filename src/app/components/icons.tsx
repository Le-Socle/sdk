'use client';

import {
  AlertTriangleIcon, BuildingIcon, CalendarIcon, CheckSquareIcon, CircleIcon, EuroIcon, FileTextIcon, FolderIcon, GaugeIcon, HomeIcon,
  InboxIcon, LinkIcon, ListIcon, MailIcon, MessageSquareIcon, PhoneIcon, SearchIcon, SettingsIcon, StarIcon, SunIcon, TagIcon, TargetIcon, UserIcon, UsersIcon,
} from 'lucide-react';
import type { IconComponent, IconSet } from '../engine/contracts';
import { useIcons } from '../engine/provider';

/** Jeu d'icônes de base : les noms que les objets de démonstration emploient. L'application le complète par `icons`. */
export const baseIcons: IconSet = {
  alert: AlertTriangleIcon,
  building: BuildingIcon,
  calendar: CalendarIcon,
  task: CheckSquareIcon,
  circle: CircleIcon,
  euro: EuroIcon,
  file: FileTextIcon,
  folder: FolderIcon,
  gauge: GaugeIcon,
  home: HomeIcon,
  inbox: InboxIcon,
  link: LinkIcon,
  list: ListIcon,
  mail: MailIcon,
  message: MessageSquareIcon,
  phone: PhoneIcon,
  search: SearchIcon,
  settings: SettingsIcon,
  star: StarIcon,
  sun: SunIcon,
  tag: TagIcon,
  target: TargetIcon,
  user: UserIcon,
  users: UsersIcon,
};

/** Icône par nom ; un nom inconnu donne un rond (jamais d'erreur d'affichage pour une icône manquante). */
export function useIcon(name?: string): IconComponent {
  const icons = useIcons();
  return (name ? icons[name] : undefined) ?? CircleIcon;
}

/** Affiche l'icône nommée. */
export function Icon({ name, className }: { name?: string; className?: string }) {
  const C = useIcon(name);
  return <C className={className} />;
}
