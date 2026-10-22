import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/cn"

/**
 * Pastille de statut : un palier de l'échelle de données, avec son libellé. La couleur ne porte pas
 * seule le sens : le libellé et un repère l'accompagnent. Elle lit `--color-data-N-*` : une marque à
 * 4 ou à 6 paliers l'habille sans qu'on la change. Le libellé du palier vient de l'appelant.
 */
const TIER_CLASSES: Record<number, string> = {
  1: "border-data-1-border bg-data-1-bg text-data-1-text",
  2: "border-data-2-border bg-data-2-bg text-data-2-text",
  3: "border-data-3-border bg-data-3-bg text-data-3-text",
  4: "border-data-4-border bg-data-4-bg text-data-4-text",
  5: "border-data-5-border bg-data-5-bg text-data-5-text",
  6: "border-data-6-border bg-data-6-bg text-data-6-text",
}
const TIER_MARK: Record<number, string> = {
  1: "bg-data-1-mark",
  2: "bg-data-2-mark",
  3: "bg-data-3-mark",
  4: "bg-data-4-mark",
  5: "bg-data-5-mark",
  6: "bg-data-6-mark",
}

const statusPillVariants = cva("inline-flex w-fit shrink-0 items-center gap-2 rounded-detail border whitespace-nowrap", {
  variants: {
    size: {
      sm: "type-label-sm h-5 px-2",
      md: "type-label h-6 px-2",
      lg: "type-label-lg h-8 px-3",
    },
  },
  defaultVariants: { size: "md" },
})

type StatusPillProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Palier de 1 (le plus favorable) à 6. */
  tier: number
  label: string
  size?: "sm" | "md" | "lg"
  /** Texte lu avant le libellé, par exemple « Niveau : ». */
  srPrefix?: string
}

function StatusPill({ tier, label, size = "md", srPrefix, className, ...props }: StatusPillProps) {
  const t = Math.min(6, Math.max(1, Math.round(tier)))
  return (
    <span data-slot="status-pill" data-tier={t} className={cn(statusPillVariants({ size }), TIER_CLASSES[t], className)} {...props}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-dot", TIER_MARK[t])} />
      {srPrefix ? <span className="sr-only">{srPrefix}</span> : null}
      {label}
    </span>
  )
}

export { StatusPill, statusPillVariants, TIER_CLASSES, TIER_MARK }
