"use client"

import * as React from "react"

import { cn } from "../../lib/cn"
import { fillMessage, useMessages } from "../messages"
import { formatNumber } from "./format"
import { tierOf, tierVar, type DataScale } from "./scale"
import { useDataScale } from "./use-data-scale"

/**
 * Jauge : un demi-cercle découpé en autant de segments que l'échelle de la marque a de paliers
 * (4 ou 6), chacun de la couleur de son palier, avec un repère à la valeur. La jauge lit
 * `--data-count` et `--data-threshold-N` : passer de 4 à 6 paliers redessine les segments, pas le
 * composant. Le repère (position) et le texte du palier doublent la couleur.
 */
const W = 120
const H = 70
const CX = W / 2
const CY = 62
const R = 50
const STROKE = 12
const GAP = 1.2

const at = (pct: number, radius = R): [number, number] => {
  const rad = Math.PI * (1 - pct / 100)
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)]
}

function segment(from: number, to: number): string {
  const capDeg = ((STROKE / 2 / R) * 100) / 180
  const a = from === 0 ? from : from + GAP / 2 + 0
  const b = to === 100 ? to : to - GAP / 2
  const [x0, y0] = at(a + (from === 0 ? capDeg : 0))
  const [x1, y1] = at(b - (to === 100 ? capDeg : 0))
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

type GaugeProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: string
  value: number | null
  max?: number
  higherIsBetter?: boolean
  scale?: DataScale
  /** Libellé de chaque palier, du 1 au dernier ; par défaut « Palier N sur M » (lu), « Palier N » (affiché). */
  tierLabels?: string[]
  display?: string
  size?: "md" | "lg"
}

function Gauge({ label, value, max = 100, higherIsBetter = false, scale: scaleProp, tierLabels, display, size = "md", className, ...props }: GaugeProps) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const pct = value === null ? null : Math.min(Math.max((value / max) * 100, 0), 100)
  const tier = pct === null ? null : tierOf(pct, scale, higherIsBetter)
  const bounds = [0, ...scale.thresholds.slice(0, scale.count - 1), 100]
  const segments = Array.from({ length: scale.count }, (_, i) => ({ from: bounds[i] ?? 0, to: bounds[i + 1] ?? 100, tier: higherIsBetter ? scale.count - i : i + 1 }))
  const tierText = tier ? (tierLabels?.[tier - 1] ?? fillMessage(messages.tier, { n: tier, count: scale.count })) : messages.notRated
  const spoken = value === null ? `${label} : ${messages.notRated}` : `${label} : ${formatNumber(value, messages.locale)} / ${formatNumber(max, messages.locale)}, ${tierText}`
  const marker = pct === null ? null : at(pct, R)
  const markerIn = pct === null ? null : at(pct, R - STROKE)
  return (
    <div role="img" aria-label={spoken} data-slot="gauge" data-size={size} data-tier={tier ?? undefined} className={cn("relative w-full max-w-xs min-w-0", size === "lg" && "max-w-xl", className)} {...props}>
      <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="block w-full" fill="none" strokeWidth={STROKE} focusable="false">
        {segments.map((s) => (
          <path key={s.tier} d={segment(s.from, s.to)} style={{ stroke: tierVar(s.tier) }} strokeLinecap="butt" />
        ))}
        {marker && markerIn ? (
          <g>
            <line x1={markerIn[0]} y1={markerIn[1]} x2={marker[0]} y2={marker[1]} className="stroke-chart-label" strokeWidth={2} strokeLinecap="round" />
            <circle cx={markerIn[0]} cy={markerIn[1]} r={3} className="fill-chart-label stroke-chart-surface" strokeWidth={2} />
          </g>
        ) : null}
      </svg>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex flex-col items-center text-chart-label">
        <span className={size === "lg" ? "type-title" : "type-figure"}>{display ?? (value === null ? "–" : formatNumber(value, messages.locale))}</span>
        <span className="type-caption text-chart-axis">{tier ? (tierLabels?.[tier - 1] ?? fillMessage(messages.tierShort, { n: tier })) : messages.notRated}</span>
      </div>
    </div>
  )
}

export { Gauge }
