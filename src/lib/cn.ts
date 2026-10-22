import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Assemble des classes Tailwind et résout les conflits (la dernière gagne). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
