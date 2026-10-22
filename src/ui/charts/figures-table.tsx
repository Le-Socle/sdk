import * as React from "react"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"
import { ScrollRegion } from "./scroll-region"
import { formatEuro, formatNumber, formatPercent } from "./format"

/**
 * Tableau de chiffres : des libellés à gauche, des chiffres alignés à droite (tabulaires, même
 * largeur), un total optionnel. Les montants s'écrivent en euros à deux décimales ; les colonnes
 * disent leur format, pas le composant.
 */
export type FigureColumn = { key: string; label: string; format?: "number" | "euro" | "percent" | "text"; digits?: number }
type Row = Record<string, string | number | null>

type Props = Omit<React.ComponentProps<"table">, "children"> & {
  caption: string
  columns: FigureColumn[]
  rows: Row[]
  total?: Row
  size?: "md" | "lg"
}

function FiguresTable({ caption, columns, rows, total, size = "md", className, ...props }: Props) {
  const messages = useMessages()
  const cell = (c: FigureColumn, v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "–"
    if (typeof v === "string") return v
    if (c.format === "euro") return formatEuro(v, messages.locale)
    if (c.format === "percent") return formatPercent(v, messages.locale, c.digits ?? 0)
    return formatNumber(v, messages.locale, c.digits)
  }
  return (
    <ScrollRegion label={caption} data-slot="figures-table">
      <table className={cn("w-full tabular-nums", size === "lg" ? "type-body" : "type-body-sm", className)} {...props}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, i) => (
              <th key={c.key} scope="col" className={cn("type-label px-3 py-2 text-chart-axis", i === 0 || c.format === "text" ? "text-left" : "text-right")}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} className="border-b border-border-subtle">
              {columns.map((c, i) =>
                i === 0 ? (
                  <th key={c.key} scope="row" className="px-3 py-2 text-left font-normal text-chart-label">{cell(c, r[c.key])}</th>
                ) : (
                  <td key={c.key} className={cn("px-3 py-2", c.format === "text" ? "text-left" : "text-right")}>{cell(c, r[c.key])}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
        {total ? (
          <tfoot>
            <tr className="border-t border-border">
              {columns.map((c, i) =>
                i === 0 ? (
                  <th key={c.key} scope="row" className="type-label px-3 py-2 text-left text-chart-label">{cell(c, total[c.key])}</th>
                ) : (
                  <td key={c.key} className={cn("type-label px-3 py-2 text-chart-label", c.format === "text" ? "text-left" : "text-right")}>{cell(c, total[c.key])}</td>
                )
              )}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </ScrollRegion>
  )
}

export { FiguresTable }
