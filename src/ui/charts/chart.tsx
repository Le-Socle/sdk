"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"

/**
 * Cadre commun des graphiques : une figure avec son titre, le graphique (masqué aux lecteurs
 * d'écran, qui n'y trouveraient que des formes) et, à la place, le tableau des données. Chaque
 * graphique du SDK passe par là : même légende, mêmes couleurs d'axe, même alternative textuelle.
 *
 * `size` règle le texte : « md » pour une page d'application, « lg » pour une slide ou un visuel
 * (les mêmes rôles typographiques, un cran au-dessus).
 */
export type ChartSize = "md" | "lg"

type FrameProps = Omit<React.ComponentProps<"figure">, "title"> & {
  /** Titre visible du graphique. */
  title?: React.ReactNode
  /** Phrase lue à la place du graphique (synthèse). Par défaut, le titre. */
  summary: string
  size?: ChartSize
  /** Légende (composants `ChartLegend`), posée sous le graphique. */
  legend?: React.ReactNode
  /** Tableau de données équivalent, lu par les lecteurs d'écran. */
  dataTable?: { head: string[]; rows: (string | number)[][] }
}

function ChartFrame({ title, summary, size = "md", legend, dataTable, className, children, ...props }: FrameProps) {
  const messages = useMessages()
  return (
    <figure
      data-slot="chart"
      data-size={size}
      className={cn("group/chart flex min-w-0 flex-col gap-3 text-foreground", className)}
      {...props}
    >
      {title ? <figcaption className="type-heading group-data-[size=lg]/chart:type-title text-heading">{title}</figcaption> : null}
      <div aria-hidden="true" className="min-w-0">{children}</div>
      {legend}
      <div className="sr-only">
        <p>{summary}</p>
        {dataTable ? (
          <table>
            <caption>{typeof title === "string" ? title : messages.chartTable}</caption>
            <thead>
              <tr>{dataTable.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {dataTable.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </figure>
  )
}

/** Zone de tracé d'un graphique recharts : prend la largeur disponible et la hauteur de `className`. */
function ChartArea({ className, children }: { className?: string; children: React.ReactElement }) {
  return (
    <div data-slot="chart-area" className={cn("h-64 w-full min-w-0 group-data-[size=lg]/chart:h-160 [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:type-caption group-data-[size=lg]/chart:[&_.recharts-cartesian-axis-tick_text]:type-lede [&_.recharts-wrapper]:outline-none", className)}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export type LegendItem = { label: string; color: string; shape?: "square" | "circle" | "diamond" | "line" }

/** Légende : un repère de la couleur et de la forme de chaque série, puis son nom. */
function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul data-slot="chart-legend" className={cn("type-caption group-data-[size=lg]/chart:type-lede flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <ChartKey color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Repère de légende ou de série : la forme double la couleur, pour que la couleur ne porte pas seule le sens. */
function ChartKey({ color, shape = "square" }: { color: string; shape?: LegendItem["shape"] }) {
  return (
    <span
      aria-hidden="true"
      data-shape={shape}
      className={cn(
        "inline-block shrink-0",
        shape === "square" && "size-3 rounded-mark",
        shape === "circle" && "size-3 rounded-dot",
        shape === "diamond" && "size-3 rotate-45 rounded-mark",
        shape === "line" && "h-0.5 w-4 rounded-mark"
      )}
      style={{ backgroundColor: color }}
    />
  )
}

/** Infobulle commune (fenêtre flottante, mêmes rôles que les menus). */
function ChartTooltipBox({ label, rows }: { label?: React.ReactNode; rows: { name: string; value: string; color?: string; shape?: LegendItem["shape"] }[] }) {
  return (
    <div className="type-body-sm min-w-32 rounded-md border border-border bg-popover px-3 py-2 text-popover-foreground shadow-2">
      {label ? <div className="type-label mb-1 text-heading">{label}</div> : null}
      <div className="grid gap-1">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">{r.color ? <ChartKey color={r.color} shape={r.shape} /> : null}{r.name}</span>
            <span className="type-label text-heading tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChartArea, ChartFrame, ChartKey, ChartLegend, ChartTooltipBox }
