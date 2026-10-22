"use client"

import * as React from "react"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"
import { formatNumber } from "./format"
import { tierOf, tierVar, type DataScale } from "./scale"
import { useDataScale } from "./use-data-scale"

/**
 * Barre : une valeur sur un maximum, sur une piste. Sans `tiered`, elle prend la couleur d'action ;
 * avec, la couleur du palier que l'échelle de la marque donne à la valeur. `value` nul = non évalué
 * (piste en tirets).
 */
type ProgressBarProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number | null
  max?: number
  /** Colore selon le palier de l'échelle de données. */
  tiered?: boolean
  /** Une valeur haute est favorable (palier 1 en haut de l'échelle). */
  higherIsBetter?: boolean
  scale?: DataScale
  /** Repère de référence (valeur précédente, moyenne…), dans la même unité que `value`. Trait fin. */
  reference?: number
  /** Cible à atteindre, dans la même unité que `value`. Trait plein sur toute la hauteur. */
  target?: number
  /** Phrase lue à la place de la barre. Par défaut : « 3,5 sur 5 ». */
  description?: string
  size?: "md" | "lg"
}

function ProgressBar({ value, max = 100, tiered = false, higherIsBetter = false, scale: scaleProp, reference, target, description, size = "md", className, ...props }: ProgressBarProps) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const ratio = value === null ? 0 : Math.min(Math.max(value / max, 0), 1)
  const tier = value === null || !tiered ? null : tierOf(ratio * 100, scale, higherIsBetter)
  const at = (v: number) => `${Math.min(Math.max(v / max, 0), 1) * 100}%`
  const fmt = (v: number) => formatNumber(v, messages.locale)
  const base = description ?? (value === null ? messages.notRated : `${fmt(value)} / ${fmt(max)}`)
  const extras = [reference !== undefined ? `${messages.chartReference} ${fmt(reference)}` : null, target !== undefined ? `${messages.chartTarget} ${fmt(target)}` : null].filter(Boolean)
  const spoken = extras.length ? `${base}, ${extras.join(", ")}` : base
  return (
    <span
      role="img"
      aria-label={spoken}
      data-slot="progress-bar"
      data-tier={tier ?? undefined}
      className={cn(
        "relative block w-full min-w-0 overflow-hidden rounded-mark",
        size === "lg" ? "h-4" : "h-2",
        value === null ? "border border-dashed border-input" : "bg-chart-track",
        className
      )}
      {...props}
    >
      {value === null ? null : (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-mark bg-primary"
          style={{ width: `${ratio * 100}%`, ...(tier ? { backgroundColor: tierVar(tier) } : null) }}
        />
      )}
      {reference === undefined ? null : <span aria-hidden="true" data-mark="reference" className="absolute top-1/4 bottom-1/4 w-px -translate-x-1/2 bg-chart-axis" style={{ left: at(reference) }} />}
      {target === undefined ? null : <span aria-hidden="true" data-mark="target" className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-chart-label" style={{ left: at(target) }} />}
    </span>
  )
}

export { ProgressBar }
