"use client"

import * as React from "react"

import { useMessages, type Messages } from "../messages"

/**
 * Libellés de paliers. Ordre de priorité, du plus fort au plus faible :
 * 1. la propriété `tierLabels` du composant ;
 * 2. `MessagesProvider` (`tierLabels`) ;
 * 3. la marque (`brand.json` › `tierLabels`, par langue, émis en `--tier-label-<langue>-<n>`) ;
 * 4. sinon aucun : le composant écrit « Palier N ».
 */

/** Valeur brute d'une variable CSS de libellé (`"Excellent"` avec ses guillemets) → texte. */
export function parseTierLabel(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  try {
    const v = JSON.parse(s)
    return typeof v === "string" && v ? v : null
  } catch {
    return s.replace(/^["']|["']$/g, "") || null
  }
}

/** Langue de la variable : « fr-FR » → « fr ». */
export const langOf = (locale: string) => locale.split("-")[0]?.toLowerCase() ?? "fr"

/** Libellés de la marque pour une langue, lus par `read(nomDeVariable)`. Vide si la marque n'en déclare pas. */
export function brandTierLabels(locale: string, count: number, read: (name: string) => string): string[] {
  const lang = langOf(locale)
  const out: string[] = []
  for (let n = 1; n <= count; n += 1) {
    const text = parseTierLabel(read(`--tier-label-${lang}-${n}`))
    if (!text) return []
    out.push(text)
  }
  return out
}

/** Choisit la liste de libellés selon l'ordre de priorité ci-dessus. */
export function resolveTierLabels(prop: string[] | undefined, messages: Pick<Messages, "tierLabels">, brand: string[]): string[] | undefined {
  if (prop?.length) return prop
  if (messages.tierLabels?.length) return messages.tierLabels
  return brand.length ? brand : undefined
}

export function useTierLabels(count: number, prop?: string[]): string[] | undefined {
  const messages = useMessages()
  const [brand, setBrand] = React.useState<string[]>([])
  React.useLayoutEffect(() => {
    if (typeof document === "undefined") return
    const styles = getComputedStyle(document.documentElement)
    const next = brandTierLabels(messages.locale, count, (name) => styles.getPropertyValue(name))
    setBrand((prev) => (prev.join("\u0000") === next.join("\u0000") ? prev : next))
  })
  return resolveTierLabels(prop, messages, brand)
}
