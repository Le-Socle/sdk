"use client"

import * as React from "react"

import { cn } from "../../lib/cn"
import { fillMessage, useMessages } from "../messages"
import { ChartKey } from "./chart"
import { formatNumber, formatPercent } from "./format"
import { tierVar, type DataScale } from "./scale"
import { useDataScale } from "./use-data-scale"

/**
 * Distribution : comment un ensemble se répartit entre les paliers de l'échelle de données. Une
 * bande empilée, un segment par palier (4 ou 6 selon la marque), avec en dessous le nombre et la
 * part de chaque palier. Les paliers sans élément restent listés : on voit qu'ils sont vides.
 * `counts[i]` est le nombre d'éléments du palier i+1 ; l'échelle de la marque fixe combien il y en a.
 */
type DistributionProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Éléments par palier, du palier 1 au dernier. Les paliers au-delà de l'échelle sont ignorés. */
  counts: number[]
  /** Libellé de chaque palier ; par défaut « Palier N ». */
  tierLabels?: string[]
  scale?: DataScale
  size?: "md" | "lg"
}

function Distribution({ counts, tierLabels, scale: scaleProp, size = "md", className, ...props }: DistributionProps) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const values = Array.from({ length: scale.count }, (_, i) => counts[i] ?? 0)
  const total = values.reduce((a, b) => a + b, 0)
  const label = (i: number) => tierLabels?.[i] ?? fillMessage(messages.tierShort, { n: i + 1 })
  const spoken = values.map((v, i) => `${label(i)} : ${formatNumber(v, messages.locale)}`).join(", ")
  return (
    <div data-slot="distribution" data-size={size} className={cn("flex w-full min-w-0 flex-col gap-3", className)} {...props}>
      <div role="img" aria-label={spoken} className={cn("flex w-full gap-0.5 overflow-hidden rounded-mark bg-chart-track", size === "lg" ? "h-8" : "h-4")}>
        {values.map((v, i) =>
          v > 0 ? <span key={i} className="block h-full" style={{ flexGrow: v, flexBasis: 0, backgroundColor: tierVar(i + 1) }} /> : null
        )}
      </div>
      <ul className={cn("grid gap-x-6 gap-y-2", scale.count > 4 ? "grid-cols-2 sm:grid-cols-3" : size === "lg" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4", size === "lg" ? "type-lede" : "type-body-sm")}>
        {values.map((v, i) => (
          <li key={i} className="flex min-w-0 items-center gap-2">
            <ChartKey color={tierVar(i + 1)} />
            <span className="min-w-0 truncate text-chart-axis">{label(i)}</span>
            <span className="type-label ml-auto shrink-0 text-chart-label tabular-nums">{formatNumber(v, messages.locale)}</span>
            <span className="shrink-0 text-chart-axis tabular-nums">{total ? formatPercent((v / total) * 100, messages.locale) : formatPercent(0, messages.locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { Distribution }
