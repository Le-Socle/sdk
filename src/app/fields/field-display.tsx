'use client';

import { CheckIcon, ExternalLinkIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { Ref, Tag } from '../engine/contracts';
import { isEmptyValue, textOf } from '../engine/query';
import { useAppMessages, useFieldOptions, useFormatters } from '../engine/provider';
import type { FieldDef, SelectOption } from '../engine/types';
import { Icon } from '../components/icons';
import { Pill } from '../components/pill';
import { PILL_CLASS, TEXT_CLASS, DOT_CLASS, toneOf } from '../components/tints';
import { UserAvatar } from '../components/user-avatar';
import { useDrawer } from '../drawer/use-drawer';

export type DisplayVariant = 'cell' | 'detail';

/** Pastille d'un tag : arrondie, pour la distinguer des statuts. */
export function TagPill({ tag, className }: { tag: Pick<Tag, 'label' | 'color'>; className?: string }) {
  return (
    <span data-slot="tag" className={cn('type-label-sm inline-flex h-5 max-w-full shrink-0 items-center truncate rounded-dot border px-2', PILL_CLASS[toneOf(tag.color)], className)}>
      <span className="truncate">{tag.label}</span>
    </span>
  );
}

export function TagList({ tags, max, className }: { tags: Tag[]; max?: number; className?: string }) {
  if (!tags?.length) return null;
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-1', className)}>
      {shown.map((t) => (
        <TagPill key={t.id} tag={t} />
      ))}
      {max && tags.length > max ? (
        <span className="type-caption text-muted-foreground" title={tags.slice(max).map((t) => t.label).join(', ')}>
          +{tags.length - max}
        </span>
      ) : null}
    </span>
  );
}

/** Lien vers un autre enregistrement : ouvre sa fiche. */
export function RecordChip({ object, id, label, sub, className }: { object?: string; id: string; label: string; sub?: string | null; className?: string }) {
  const drawer = useDrawer();
  const m = useAppMessages();
  const content = (
    <>
      <span className="truncate">{label || m.table.untitled}</span>
      {sub ? <span className="truncate text-muted-foreground">· {sub}</span> : null}
    </>
  );
  const base = 'type-label-sm inline-flex h-5 max-w-full items-center gap-1 rounded-detail bg-muted px-1.5';
  if (!object) return <span className={cn(base, className)}>{content}</span>;
  return (
    <button
      type="button"
      data-chip={object}
      onClick={(e) => {
        e.stopPropagation();
        drawer.open(object, id);
      }}
      className={cn(base, 'focus-ring text-foreground transition-colors duration-micro hover:bg-accent hover:text-accent-foreground', className)}
    >
      {content}
    </button>
  );
}

export function SelectValueView({ options, value }: { options?: SelectOption[]; value: unknown }) {
  const opt = options?.find((o) => o.value === String(value));
  if (!opt) return value ? <span className="text-muted-foreground">{String(value)}</span> : null;
  return (
    <Pill color={opt.color} icon={opt.icon}>
      {opt.label}
    </Pill>
  );
}

/** Pourcentage : valeur et petite barre. */
function PercentValue({ value }: { value: number }) {
  const m = useAppMessages();
  const tone = value >= 90 ? 'success' : value >= 30 ? 'warning' : 'danger';
  return (
    <span className="inline-flex w-16 flex-col items-stretch gap-1 tabular-nums">
      <span className="type-caption text-right">{m.field.percent.replace('{n}', String(value))}</span>
      <span className="relative h-1.5 w-full overflow-hidden rounded-dot bg-muted" aria-hidden="true">
        <span className={cn('absolute inset-y-0 left-0 rounded-dot', DOT_CLASS[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /> {/* hardcoded-ok: largeur calculée */}
      </span>
    </span>
  );
}

export interface SignalValue {
  label: string;
  date?: string | null;
  url?: string | null;
  family?: string | null;
}

/** Signaux : une phrase, une date, un lien (jamais sans date ni source à l'écran). */
export function SignalList({ signals, compact }: { signals: SignalValue[]; compact?: boolean }) {
  const f = useFormatters();
  const m = useAppMessages();
  const list = signals.filter((s) => s && s.label);
  if (compact) {
    const s = list[0];
    if (!s) return null;
    return (
      <span className="truncate" title={list.map((x) => x.label).join('\n')}>
        {s.label}
        {s.date ? <span className="text-muted-foreground"> · {f.date(s.date, { full: true })}</span> : null}
      </span>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {list.map((s, i) => (
        <li key={i} className="flex flex-col gap-0.5 rounded-md border border-border bg-muted px-2 py-1.5">
          <span className="type-body-sm">{s.label}</span>
          <span className="type-caption flex flex-wrap items-center gap-x-2 text-muted-foreground">
            {s.family ? <span>{s.family}</span> : null}
            {s.date ? <span className="tabular-nums">{f.date(s.date, { full: true })}</span> : <span>{m.field.noDate}</span>}
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 text-link hover:underline">
                <ExternalLinkIcon className="size-3" aria-hidden="true" /> {m.field.source}
              </a>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Placeholder({ readOnly, text }: { readOnly?: boolean; text?: string }) {
  const m = useAppMessages();
  return <span className="text-muted-foreground">{text ?? (readOnly ? m.field.emptyReadOnly : m.field.emptyEditable)}</span>;
}

/**
 * Valeur d'un champ en lecture, selon son type. `cell` : une ligne, tronquée (tableau). `detail` :
 * toutes les valeurs (fiche). Les nombres sont en chiffres tabulaires ; une date en retard passe au
 * ton d'erreur sans passer en gras.
 */
export function FieldDisplay({ field, value, row, variant = 'cell' }: { field: FieldDef; value: unknown; row?: Record<string, unknown>; variant?: DisplayVariant }) {
  const f = useFormatters();
  const m = useAppMessages();
  const options = useFieldOptions(field);
  const overdue = field.overdueKey && row ? Boolean(row[field.overdueKey]) : false;
  const empty = isEmptyValue(value);
  const detail = variant === 'detail';

  if (field.type === 'boolean') {
    return value ? (
      <span className="type-body-sm inline-flex items-center gap-1">
        <CheckIcon className={cn('size-3.5', TEXT_CLASS.success)} aria-hidden="true" /> {m.table.yes}
      </span>
    ) : (
      <span className="type-body-sm text-muted-foreground">{m.table.no}</span>
    );
  }

  if (empty) {
    if (field.emptyLabel) return <span className="text-muted-foreground">{field.emptyLabel}</span>;
    return detail ? <Placeholder readOnly={field.readOnly} text={field.placeholder && field.type === 'relation' ? field.placeholder : undefined} /> : null;
  }

  switch (field.type) {
    case 'text':
      return <span className="block truncate">{String(value)}</span>;
    case 'longtext':
      return <span className={cn(detail ? 'whitespace-pre-wrap' : 'line-clamp-1')}>{String(value)}</span>;
    case 'richtext':
      return <span className="line-clamp-2 text-muted-foreground">{String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</span>;
    case 'number':
      return <span className="tabular-nums">{f.number(value)}</span>;
    case 'percent':
      return <PercentValue value={Number(value)} />;
    case 'signals':
      return <SignalList signals={(Array.isArray(value) ? value : [value]) as SignalValue[]} compact={!detail} />;
    case 'currency':
      return <span className="tabular-nums">{f.money(value)}</span>;
    case 'date':
      return (
        <span className={cn('tabular-nums', overdue && TEXT_CLASS.danger)}>
          {field.relative ? f.relative(value) : f.date(value, { full: field.fullDate })}
          {overdue ? <span className="type-caption ml-1">({f.relative(value)})</span> : null}
        </span>
      );
    case 'datetime': {
      const sub = field.sub && row ? row[field.sub] : undefined;
      const subOpt = field.subOptions?.find((o) => o.value === String(sub));
      return (
        <span className="flex min-w-0 items-center gap-2">
          {subOpt?.icon ? <Icon name={subOpt.icon} className="size-3.5 shrink-0 text-muted-foreground" /> : null}
          <span className={cn('shrink-0 tabular-nums', overdue && TEXT_CLASS.danger)} title={f.dateTime(value)}>
            {field.relative ? f.relative(value) : f.dateTime(value)}
          </span>
          {sub && !subOpt ? <span className="truncate text-muted-foreground">{String(sub)}</span> : null}
        </span>
      );
    }
    case 'select':
      return <SelectValueView options={options} value={value} />;
    case 'multiselect':
      return (
        <span className="flex flex-wrap gap-1">
          {(value as string[]).map((v) => (
            <SelectValueView key={v} options={options} value={v} />
          ))}
        </span>
      );
    case 'emails':
    case 'phones': {
      const list = value as string[];
      const isMail = field.type === 'emails';
      const Ic = isMail ? MailIcon : PhoneIcon;
      return (
        <span className={cn('flex min-w-0 gap-1', detail ? 'flex-col' : 'items-center')}>
          {(detail ? list : list.slice(0, 1)).map((e) => (
            <a
              key={e}
              href={isMail ? `mailto:${e}` : `tel:${e.replace(/\s/g, '')}`}
              onClick={(ev) => ev.stopPropagation()}
              className={cn('inline-flex min-w-0 items-center gap-1 text-foreground hover:underline', !isMail && 'tabular-nums')}
            >
              <Ic className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{e}</span>
            </a>
          ))}
          {!detail && list.length > 1 ? <span className="type-caption text-muted-foreground">+{list.length - 1}</span> : null}
        </span>
      );
    }
    case 'url': {
      const url = String(value);
      return (
        <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex min-w-0 items-center gap-1 text-link hover:underline">
          <ExternalLinkIcon className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
        </a>
      );
    }
    case 'textlist':
      return (
        <span className="flex flex-wrap gap-1">
          {(value as string[]).map((v) => (
            <span key={v} className="type-label-sm rounded-detail bg-muted px-1.5 py-0.5">
              {v}
            </span>
          ))}
        </span>
      );
    case 'relation': {
      const v = value as Ref;
      return <RecordChip object={v.object ?? field.target} id={v.id} label={v.label} />;
    }
    case 'relations': {
      const list = value as Ref[];
      const shown = detail ? list : list.slice(0, 1);
      return (
        <span className={cn('flex min-w-0 gap-1', detail ? 'flex-wrap' : 'items-center')}>
          {shown.map((v) => (
            <RecordChip key={`${v.object ?? ''}${v.id}`} object={v.object ?? field.target} id={v.id} label={v.label} sub={detail ? v.sub : null} />
          ))}
          {!detail && list.length > 1 ? (
            <span className="type-caption shrink-0 text-muted-foreground" title={list.slice(1).map((x) => x.label).join(', ')}>
              +{list.length - 1}
            </span>
          ) : null}
        </span>
      );
    }
    case 'tags':
      return <TagList tags={value as Tag[]} max={detail ? undefined : 2} className={detail ? undefined : 'flex-nowrap'} />;
    case 'user': {
      const v = value as Ref;
      return (
        <span className="inline-flex min-w-0 items-center gap-2">
          <UserAvatar name={v.label} />
          <span className="truncate">{v.label}</span>
        </span>
      );
    }
    case 'users': {
      const list = value as Ref[];
      return (
        <span className="flex flex-wrap items-center gap-2">
          {list.map((v) => (
            <span key={v.id} className="inline-flex items-center gap-1">
              <UserAvatar name={v.label} /> {v.label}
            </span>
          ))}
        </span>
      );
    }
    default:
      return <span>{textOf(value)}</span>;
  }
}
