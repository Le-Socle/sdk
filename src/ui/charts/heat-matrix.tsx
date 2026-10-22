import * as React from "react"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"
import { formatNumber } from "./format"
import { ScrollRegion } from "./scroll-region"
import { tierOf, useDataScale, type DataScale } from "./scale"
import { TIER_CLASSES } from "./status-pill"

/**
 * Matrice : des lignes, des colonnes, une cellule par croisement, colorée par palier de l'échelle
 * de données (valeurs de 0 à 100). Chaque cellule écrit sa valeur : la couleur ne porte jamais seule
 * le sens. Un tableau HTML : lecteurs d'écran et clavier s'y retrouvent.
 */
type Cell = number | null
type HeatMatrixProps = Omit<React.ComponentProps<"table">, "children"> & {
  caption: string
  columns: string[]
  rows: { label: string; values: Cell[] }[]
  higherIsBetter?: boolean
  scale?: DataScale
  formatValue?: (v: number) => string
  size?: "md" | "lg"
}

function HeatMatrix({ caption, columns, rows, higherIsBetter = false, scale: scaleProp, formatValue, size = "md", className, ...props }: HeatMatrixProps) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const fmt = formatValue ?? ((v: number) => formatNumber(v, messages.locale))
  return (
    <ScrollRegion label={caption} data-slot="heat-matrix" data-size={size}>
      <table className={cn("w-full border-separate border-spacing-1 tabular-nums", size === "lg" ? "type-body" : "type-body-sm", className)} {...props}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <td />
            {columns.map((c) => (
              <th key={c} scope="col" className="type-label px-1 pb-1 text-center text-chart-axis">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="type-label pr-2 text-left text-chart-label">{r.label}</th>
              {r.values.map((v, i) => {
                const tier = v === null ? null : tierOf(v, scale, higherIsBetter)
                return (
                  <td
                    key={i}
                    data-tier={tier ?? undefined}
                    className={cn("rounded-mark border px-1 text-center", size === "lg" ? "h-14" : "h-control-lg", tier ? TIER_CLASSES[tier] : "border-dashed border-input text-chart-axis")}
                  >
                    {v === null ? <><span aria-hidden="true">–</span><span className="sr-only">{messages.notRated}</span></> : fmt(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  )
}

export { HeatMatrix }
