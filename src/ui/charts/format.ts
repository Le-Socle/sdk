/** Nombre avec la langue de l'application : chiffres tabulaires, séparateurs de la langue. */
export function formatNumber(value: number, locale = 'fr-FR', digits?: number): string {
  return new Intl.NumberFormat(locale, digits === undefined ? undefined : { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** Montant en euros, toujours à deux décimales : 12 480,00 €. */
export function formatEuro(value: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

/** Pourcentage : la valeur est déjà sur 100. */
export function formatPercent(value: number, locale = 'fr-FR', digits = 0): string {
  return `${formatNumber(value, locale, digits)}\u202f%`;
}
