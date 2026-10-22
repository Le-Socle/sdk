// Polices de la marque active, lues dans les valeurs brutes générées.
import { activeValues } from './ui';
import type { FontDeclaration } from '../../src/tokens/types';

export function fontDeclarations(): (FontDeclaration & { role: string })[] {
  const fonts = activeValues().fonts ?? {};
  return Object.entries(fonts).map(([role, f]) => ({ role, ...f }));
}
