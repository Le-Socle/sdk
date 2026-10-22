"use client"

import * as React from "react"
import { Bar, BarChart as RBarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts"

import { useMessages } from "../messages"
import { ChartArea, ChartFrame, ChartLegend, ChartTooltipBox, type ChartSize, type LegendItem } from "./chart"
import { formatNumber } from "./format"
import { seriesVar, tierOf, tierVar, type DataScale } from "./scale"
import { useDataScale } from "./use-data-scale"

/**
 * Barres : comparer des catégories. Horizontales (libellés longs) ou verticales ; plusieurs séries
 * côte à côte (couleurs `series-N`), ou une série colorée par palier de l'échelle de données
 * (`tiered`, valeurs de 0 à 100). Les valeurs s'écrivent au bout des barres : on lit le chiffre,
 * pas la couleur.
 */
type Datum = Record<string, string | number | null>
export type BarSeries = { key: string; label: string }

type Props = Omit<React.ComponentProps<"figure">, "title"> & {
  title?: React.ReactNode
  data: Datum[]
  categoryKey: string
  series: BarSeries[]
  summary: string
  size?: ChartSize
  layout?: "horizontal" | "vertical"
  /** Colore chaque barre selon son palier (série unique, valeurs de 0 à 100). */
  tiered?: boolean
  higherIsBetter?: boolean
  scale?: DataScale
  formatValue?: (v: number) => string
  domain?: [number, number]
  areaClassName?: string
}

function BarChart({ title, data, categoryKey, series, summary, size = "md", layout = "vertical", tiered = false, higherIsBetter = false, scale: scaleProp, formatValue, domain, areaClassName, ...props }: Props) {
  const scale = useDataScale(scaleProp)
  const messages = useMessages()
  const fmt = formatValue ?? ((v: number) => formatNumber(v, messages.locale))
  const horizontal = layout === "horizontal"
  const items: LegendItem[] = series.map((s, i) => ({ label: s.label, color: seriesVar(i + 1) }))
  const dataTable = { head: [messages.chartCategory, ...series.map((s) => s.label)], rows: data.map((d) => [String(d[categoryKey] ?? ""), ...series.map((s) => (typeof d[s.key] === "number" ? fmt(d[s.key] as number) : "–"))]) }
  const first = series[0]?.key ?? ""
  const colorOf = (d: Datum, i: number) => (tiered && series.length === 1 && typeof d[first] === "number" ? tierVar(tierOf(d[first] as number, scale, higherIsBetter)) : seriesVar(i + 1))
  return (
    <ChartFrame title={title} summary={summary} size={size} legend={series.length > 1 ? <ChartLegend items={items} /> : undefined} dataTable={dataTable} {...props}>
      <ChartArea className={areaClassName}>
        <RBarChart accessibilityLayer={false} data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 20, right: horizontal ? 48 : 8, bottom: 4, left: 0 }} barCategoryGap="28%">
          <CartesianGrid horizontal={!horizontal} vertical={horizontal} className="stroke-chart-grid" />
          {horizontal ? (
            <>
              <XAxis type="number" domain={domain} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmt(v)} />
              <YAxis type="category" dataKey={categoryKey} interval={0} tickLine={false} axisLine={{ className: "stroke-input" }} width={size === "lg" ? 200 : 120} />
            </>
          ) : (
            <>
              <XAxis dataKey={categoryKey} interval={0} tickLine={false} axisLine={{ className: "stroke-input" }} tickMargin={10} />
              <YAxis domain={domain} tickLine={false} axisLine={false} width="auto" tickFormatter={(v: number) => fmt(v)} />
            </>
          )}
          <Tooltip
            cursor={{ className: "fill-chart-track" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox label={String(label ?? "")} rows={payload.map((p, i) => ({ name: String(series.find((s) => s.key === p.dataKey)?.label ?? p.name), value: typeof p.value === "number" ? fmt(p.value) : "–", color: seriesVar(i + 1) }))} />
              ) : null
            }
          />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={seriesVar(i + 1)} radius={0} isAnimationActive={false}>
              {data.map((d, k) => (
                <Cell key={k} fill={colorOf(d, i)} />
              ))}
              {series.length === 1 ? <LabelList dataKey={s.key} position={horizontal ? "right" : "top"} offset={8} className="type-label group-data-[size=lg]/chart:type-heading fill-chart-label tabular-nums" formatter={(v: unknown) => fmt(Number(v))} /> : null}
            </Bar>
          ))}
        </RBarChart>
      </ChartArea>
    </ChartFrame>
  )
}

export { BarChart }
