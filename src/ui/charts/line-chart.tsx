"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart as RLineChart, Tooltip, XAxis, YAxis } from "recharts"

import { useMessages } from "../messages"
import { ChartArea, ChartFrame, ChartLegend, ChartTooltipBox, type ChartSize, type LegendItem } from "./chart"
import { formatNumber } from "./format"
import { seriesVar } from "./scale"

/**
 * Courbe : une ou plusieurs séries dans le temps (ou sur une échelle ordonnée). Les séries prennent
 * les couleurs `series-1` à `series-6` dans l'ordre ; chacune a un repère de forme différente
 * (carré, rond, losange…), car la couleur ne doit pas porter seule la distinction. Base recharts.
 */
export type LineSeries = { key: string; label: string }
type Datum = Record<string, string | number | null>

const SHAPES: NonNullable<LegendItem["shape"]>[] = ["square", "circle", "diamond"]

function Marker({ cx = 0, cy = 0, shape, color, size }: { cx?: number; cy?: number; shape: string; color: string; size: number }) {
  const props = { fill: color, className: "stroke-chart-surface", strokeWidth: 2 }
  if (shape === "circle") return <circle cx={cx} cy={cy} r={size / 2} {...props} />
  if (shape === "diamond") return <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} transform={`rotate(45 ${cx} ${cy})`} {...props} />
  return <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} {...props} />
}

type Props = Omit<React.ComponentProps<"figure">, "title"> & {
  title?: React.ReactNode
  /** Une ligne par abscisse : `{ [categoryKey]: "Janv.", [serie.key]: 12 }`. */
  data: Datum[]
  categoryKey: string
  series: LineSeries[]
  summary: string
  size?: ChartSize
  /** Bornes de l'axe vertical ; par défaut automatiques. */
  domain?: [number, number]
  /** Mise en forme des valeurs (axe, infobulle). */
  formatValue?: (v: number) => string
  /** Affiche la valeur au-dessus de chaque point (série unique). */
  showValues?: boolean
  /** Largeur de l'axe vertical (px), à élargir pour des valeurs longues. */
  yAxisWidth?: number
  /** Hauteur de la zone de tracé. */
  areaClassName?: string
}

function LineChart({ title, data, categoryKey, series, summary, size = "md", domain, formatValue, showValues = false, yAxisWidth, areaClassName, ...props }: Props) {
  const messages = useMessages()
  const fmt = formatValue ?? ((v: number) => formatNumber(v, messages.locale))
  const marker = size === "lg" ? 12 : 8
  const items: LegendItem[] = series.map((s, i) => ({ label: s.label, color: seriesVar(i + 1), shape: SHAPES[i % SHAPES.length] }))
  const dataTable = { head: [messages.chartCategory, ...series.map((s) => s.label)], rows: data.map((d) => [String(d[categoryKey] ?? ""), ...series.map((s) => (typeof d[s.key] === "number" ? fmt(d[s.key] as number) : "–"))]) }
  return (
    <ChartFrame title={title} summary={summary} size={size} legend={series.length > 1 ? <ChartLegend items={items} /> : undefined} dataTable={dataTable} {...props}>
      <ChartArea className={areaClassName}>
        <RLineChart accessibilityLayer={false} data={data} margin={{ top: showValues ? 24 : 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} className="stroke-chart-grid" />
          <XAxis dataKey={categoryKey} tickLine={false} axisLine={{ className: "stroke-input" }} tickMargin={10} padding={{ left: 16, right: 16 }} />
          <YAxis domain={domain} tickLine={false} axisLine={false} width={yAxisWidth ?? "auto"} tickFormatter={(v: number) => fmt(v)} />
          <Tooltip
            cursor={{ className: "stroke-input" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox label={String(label ?? "")} rows={payload.map((p, i) => ({ name: String(series.find((s) => s.key === p.dataKey)?.label ?? p.name), value: typeof p.value === "number" ? fmt(p.value) : "–", color: seriesVar(series.findIndex((s) => s.key === p.dataKey) + 1 || i + 1), shape: SHAPES[Math.max(0, series.findIndex((s) => s.key === p.dataKey)) % SHAPES.length] }))} />
              ) : null
            }
          />
          {series.map((s, i) => {
            const color = seriesVar(i + 1)
            const shape = SHAPES[i % SHAPES.length] as string
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                type="linear"
                stroke={color}
                strokeWidth={size === "lg" ? 3 : 2}
                strokeLinejoin="round"
                dot={<Marker shape={shape} color={color} size={marker} />}
                activeDot={<Marker shape={shape} color={color} size={marker + 4} />}
                isAnimationActive={false}
                label={showValues && series.length === 1 ? { position: "top", offset: 10, className: "type-label group-data-[size=lg]/chart:type-heading fill-chart-label tabular-nums", formatter: (v: unknown) => fmt(Number(v)) } : undefined}
              />
            )
          })}
        </RLineChart>
      </ChartArea>
    </ChartFrame>
  )
}

export { LineChart }
