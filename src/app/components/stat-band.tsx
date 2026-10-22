'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Skeleton } from '../../ui/skeleton';
import { useAppMessages } from '../engine/provider';
import { DOT_CLASS, TEXT_CLASS, toneOf, type Tone } from './tints';

export interface StatItem {
  key: string;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'danger' | 'warning' | 'success';
  chart?:
    | { type: 'spark'; data: number[]; labels?: string[] }
    | { type: 'segments'; data: { label: string; value: number; color?: string; display?: string }[] }
    /** Entonnoir : chaque étape contenue dans la précédente, avec son taux sur l'étape d'avant. */
    | { type: 'funnel'; data: { label: string; value: number }[] }
    /** Jauge : valeur sur un plafond, ton d'avertissement au seuil, d'erreur au plafond. */
    | { type: 'gauge'; value: number; max: number; alert?: number };
  /** Occupe deux colonnes du bandeau. */
  wide?: boolean;
  onClick?: () => void;
}

const TONE_TEXT: Record<NonNullable<StatItem['tone']>, string> = {
  default: '',
  danger: TEXT_CLASS.danger,
  warning: TEXT_CLASS.warning,
  success: TEXT_CLASS.success,
};

function Spark({ data, labels, label }: { data: number[]; labels?: string[]; label: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="hidden h-7 shrink-0 items-end gap-0.5 sm:flex" role="img" aria-label={label}>
      {data.map((v, i) => (
        <span
          key={i}
          title={labels ? `${labels[i]} : ${v}` : String(v)}
          className={cn('w-1.5 rounded-detail', i === data.length - 1 ? 'bg-foreground' : 'bg-border-strong')}
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }} // hardcoded-ok: hauteur calculée de la barre
        />
      ))}
    </div>
  );
}

function Segments({ data }: { data: Extract<NonNullable<StatItem['chart']>, { type: 'segments' }>['data'] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex h-1.5 w-full overflow-hidden rounded-dot bg-muted">
        {data.map((d) => (
          <span key={d.label} title={`${d.label} : ${d.value}`} className={cn('h-full', DOT_CLASS[toneOf(d.color)])} style={{ width: `${(d.value / total) * 100}%` }} /> // hardcoded-ok: largeur calculée du segment
        ))}
      </div>
      <div className="type-caption flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
        {data.map((d) => (
          <span key={d.label} className="inline-flex items-center gap-1">
            <span className={cn('size-1.5 rounded-dot', DOT_CLASS[toneOf(d.color)])} aria-hidden="true" />
            {d.label} <span className="text-foreground tabular-nums">{d.display ?? d.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Funnel({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const top = Math.max(1, data[0]?.value ?? 0);
  return (
    <div className="flex flex-col gap-1" role="list" aria-label={label}>
      {data.map((d, i) => {
        const prev = i > 0 ? (data[i - 1]?.value ?? 0) : null;
        const rate = prev ? Math.min(100, Math.round((d.value / prev) * 100)) : null;
        return (
          <div key={d.label} role="listitem" className="type-caption flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-muted-foreground">{d.label}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-detail bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded-detail bg-primary"
                style={{ width: `${Math.max(d.value > 0 ? 3 : 0, (d.value / top) * 100)}%`, opacity: 1 - i * 0.15 }} // hardcoded-ok: largeur et opacité calculées
              />
            </span>
            <span className="w-8 shrink-0 text-right tabular-nums">{d.value}</span>
            <span className="w-11 shrink-0 text-right text-muted-foreground tabular-nums">{i === 0 ? '' : prev ? `${rate} %` : '–'}</span>
          </div>
        );
      })}
    </div>
  );
}

function GaugeBar({ value, max, alert = 80 }: { value: number; max: number; alert?: number }) {
  const ratio = max > 0 ? value / max : 0;
  const tone: Tone = ratio >= 1 ? 'danger' : ratio * 100 >= alert ? 'warning' : 'success';
  return (
    <span className="mt-3 flex flex-col gap-1">
      <span className="type-caption text-right text-muted-foreground tabular-nums">{Math.round(ratio * 100)} %</span>
      <span className="flex h-1.5 w-full overflow-hidden rounded-dot bg-muted" role="meter" aria-valuenow={value} aria-valuemax={max} aria-valuemin={0} aria-label={`${Math.round(ratio * 100)} %`}>
        <span className={cn('h-full rounded-dot', DOT_CLASS[tone])} style={{ width: `${Math.min(100, ratio * 100)}%` }} /> {/* hardcoded-ok: largeur calculée */}
      </span>
    </span>
  );
}

/**
 * Bandeau de chiffres : une carte par indicateur (valeur, libellé, petit graphique facultatif).
 * Cinq colonnes au large, deux en étroit. `compact` : une seule ligne de compteurs. Les valeurs
 * sont en chiffres tabulaires ; aucune n'est en gras.
 */
export function StatBand({ items, loading, compact, className }: { items: StatItem[]; loading?: boolean; compact?: boolean; className?: string }) {
  const m = useAppMessages();
  if (compact) {
    return (
      <div data-slot="stat-band" role="group" aria-label={m.statBand.label} className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-2', className)}>
        {items.map((it) => (
          <div key={it.key} data-stat={it.key} className="type-body-sm flex min-w-0 items-center gap-2">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>
                <span className={cn('type-figure-sm tabular-nums', TONE_TEXT[it.tone ?? 'default'])}>{it.value}</span>
                <span className="text-muted-foreground">{it.label}</span>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div data-slot="stat-band" role="group" aria-label={m.statBand.label} className={cn('grid grid-flow-row-dense grid-cols-2 gap-3 lg:grid-cols-5', className)}>
      {items.map((it) => {
        const Tag = it.onClick ? 'button' : 'div';
        return (
          <Tag
            key={it.key}
            type={it.onClick ? 'button' : undefined}
            onClick={it.onClick}
            data-stat={it.key}
            className={cn(
              'flex min-h-28 min-w-0 flex-col justify-start gap-3 rounded-lg border border-border bg-card p-4 text-left',
              it.onClick && 'focus-ring transition-colors duration-micro hover:bg-muted',
              it.chart?.type === 'segments' && !it.wide && 'col-span-2 lg:col-span-1',
              it.wide && 'col-span-2',
            )}
          >
            <span className="type-body-sm line-clamp-2 text-muted-foreground">{it.label}</span>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : it.chart?.type === 'segments' ? (
              <Segments data={it.chart.data} />
            ) : it.chart?.type === 'funnel' ? (
              <Funnel data={it.chart.data} label={m.statBand.funnel} />
            ) : (
              <div className="min-w-0">
                <div className="flex items-end justify-between gap-2">
                  <div className={cn('type-figure text-heading', TONE_TEXT[it.tone ?? 'default'])}>{it.value}</div>
                  {it.chart?.type === 'spark' ? <Spark data={it.chart.data} labels={it.chart.labels} label={m.statBand.evolution} /> : null}
                </div>
                {it.chart?.type === 'gauge' ? <GaugeBar value={it.chart.value} max={it.chart.max} alert={it.chart.alert} /> : null}
                {it.hint ? <div className="type-caption mt-2 line-clamp-2 text-muted-foreground">{it.hint}</div> : null}
              </div>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
