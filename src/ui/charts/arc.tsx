import * as React from "react"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"
import { formatNumber } from "./format"
import { tierOf, tierVar, useDataScale, type DataScale } from "./scale"

/**
 * Arc : un anneau qui se remplit d'une valeur, avec la valeur au centre. Couleur du palier (échelle
 * de la marque) ou couleur d'action. Géométrie en unités du viewBox : l'anneau s'adapte à toute
 * taille ; `size` règle le texte du centre.
 */
const VIEW = 120
const C = VIEW / 2
const R = 50
const STROKE = 12
const CAP = (STROKE / 2 / R) * (180 / Math.PI)

const point = (deg: number): [number, number] => {
  const rad = (deg * Math.PI) / 180
  return [C + R * Math.sin(rad), C - R * Math.cos(rad)]
}

function arcPath(from: number, to: number): string {
  const a = from + CAP
  const b = Math.max(to - CAP, a + 0.01)
  const [x0, y0] = point(a)
  const [x1, y1] = point(b)
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${b - a > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

const TRACK = `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R}`

type ArcProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: string
  value: number | null
  max?: number
  tiered?: boolean
  higherIsBetter?: boolean
  scale?: DataScale
  /** Texte du centre ; par défaut la valeur. */
  display?: string
  size?: "sm" | "md" | "lg"
}

function Arc({ label, value, max = 100, tiered = false, higherIsBetter = false, scale: scaleProp, display, size = "md", className, ...props }: ArcProps) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const ratio = value === null ? 0 : Math.min(Math.max(value / max, 0), 1)
  const tier = value === null || !tiered ? null : tierOf(ratio * 100, scale, higherIsBetter)
  const end = ratio * 360
  const fill = end > 0 ? arcPath(0, Math.min(end, 360 - CAP)) : null
  const shown = display ?? (value === null ? "–" : formatNumber(value, messages.locale))
  const spoken = value === null ? `${label} : ${messages.notRated}` : `${label} : ${formatNumber(value, messages.locale)} / ${formatNumber(max, messages.locale)}${tier ? `, ${messages.tier(tier, scale.count)}` : ""}`
  return (
    <div role="img" aria-label={spoken} data-slot="arc" data-size={size} data-tier={tier ?? undefined} className={cn("relative shrink-0", size === "lg" && "size-64", size === "md" && "size-40", size === "sm" && "size-24", className)} {...props}>
      <svg aria-hidden="true" viewBox={`0 0 ${VIEW} ${VIEW}`} className="size-full" fill="none" strokeLinecap="round" strokeWidth={STROKE} focusable="false">
        {value === null ? (
          <circle cx={C} cy={C} r={R} className="stroke-input" strokeDasharray="3 7" strokeLinecap="butt" strokeWidth={STROKE / 3} />
        ) : (
          <>
            <path d={TRACK} className="stroke-chart-track" />
            {fill ? <path d={fill} className="stroke-primary" style={tier ? { stroke: tierVar(tier) } : undefined} /> : null}
          </>
        )}
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center text-chart-label">
        <span className={size === "sm" ? "type-figure-sm" : "type-figure"}>{shown}</span>
        {size === "sm" ? null : <span className="type-caption text-chart-axis">{value === null ? messages.notRated : `/ ${formatNumber(max, messages.locale)}`}</span>}
      </div>
    </div>
  )
}

export { Arc }
