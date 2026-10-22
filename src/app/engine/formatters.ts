// Formats d'affichage : dates, heures, montants, nombres. Fabriqués pour une langue, un fuseau et
// une devise (défaut : français, Paris, euro, 2 décimales). Un seul jeu de formats par application,
// fourni par le moteur ; les composants ne créent jamais leurs propres `Intl`.

export interface FormatterOptions {
  locale?: string;
  timeZone?: string;
  currency?: string;
  /** Décimales des montants : 2 par défaut (règle d'interface), 0 pour un affichage entier. */
  moneyDigits?: 0 | 2;
  /** Mots de la date relative et des jours proches. Défaut : français. */
  words?: Partial<FormatterWords>;
  /** Date de référence (tests, démonstration). Défaut : maintenant. */
  now?: () => Date;
}

export interface FormatterWords {
  today: string;
  tomorrow: string;
  yesterday: string;
  /** Gabarits avec `{n}` : « il y a {n} », « dans {n} ». */
  past: string;
  future: string;
  days: string;
  weeks: string;
  months: string;
  year: string;
  years: string;
}

export const wordsFr: FormatterWords = {
  today: 'aujourd’hui',
  tomorrow: 'demain',
  yesterday: 'hier',
  past: 'il y a {n}',
  future: 'dans {n}',
  days: '{n} j',
  weeks: '{n} sem.',
  months: '{n} mois',
  year: '{n} an',
  years: '{n} ans',
};

export interface Formatters {
  date(v: unknown, o?: { short?: boolean; full?: boolean }): string;
  time(v: unknown): string;
  dateTime(v: unknown): string;
  relative(v: unknown): string;
  money(v: unknown, compact?: boolean): string;
  number(v: unknown): string;
  /** `plural(3, 'projet', 'projets')` donne « 3 projets ». */
  plural(n: number, one: string, many: string): string;
  daysFromToday(v: unknown): number | null;
  dayKey(v: unknown): string;
  today(): string;
  toDate(v: unknown): Date | null;
  /** Valeur pour `<input type="datetime-local">` dans le fuseau configuré. */
  toLocalInput(v: unknown): string;
  fromLocalInput(v: string): string | null;
}

/** Date reconnue : objet Date, ISO complet ou jour calendaire `AAAA-MM-JJ` (lu à midi, sans décalage de fuseau). */
export function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  const s = String(v);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T12:00:00`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fill(template: string, n: number | string): string {
  return template.replace('{n}', String(n));
}

export function createFormatters(o: FormatterOptions = {}): Formatters {
  const locale = o.locale ?? 'fr-FR';
  const timeZone = o.timeZone ?? 'Europe/Paris';
  const currency = o.currency ?? 'EUR';
  const digits = o.moneyDigits ?? 2;
  const words = { ...wordsFr, ...o.words };
  const now = o.now ?? (() => new Date());

  const dateFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone });
  const dateShortFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone });
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone });
  const moneyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
  const moneyCompactFmt = new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 });
  const numFmt = new Intl.NumberFormat(locale);

  const dayKey = (v: unknown) => {
    const d = toDate(v);
    return d ? dayKeyFmt.format(d) : '';
  };
  const today = () => dayKeyFmt.format(now());
  const shiftKey = (key: string, days: number) => {
    const d = new Date(`${key}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const dayIndex = (key: string) => Date.parse(`${key}T12:00:00Z`) / 86400000;

  const daysFromToday = (v: unknown) => {
    const k = dayKey(v);
    return k ? Math.round(dayIndex(k) - dayIndex(today())) : null;
  };

  const date: Formatters['date'] = (v, opts = {}) => {
    const d = toDate(v);
    if (!d) return '';
    if (opts.full) return dateFmt.format(d);
    const k = dayKey(d);
    const t = today();
    if (k === t) return capitalize(words.today);
    if (k === shiftKey(t, 1)) return capitalize(words.tomorrow);
    if (k === shiftKey(t, -1)) return capitalize(words.yesterday);
    const sameYear = k.slice(0, 4) === t.slice(0, 4);
    return opts.short || sameYear ? dateShortFmt.format(d) : dateFmt.format(d);
  };

  const time = (v: unknown) => {
    const d = toDate(v);
    return d ? timeFmt.format(d) : '';
  };

  const relative = (v: unknown) => {
    const days = daysFromToday(v);
    if (days === null) return '';
    if (days === 0) return words.today;
    if (days === -1) return words.yesterday;
    if (days === 1) return words.tomorrow;
    const abs = Math.abs(days);
    const unit =
      abs < 14
        ? fill(words.days, abs)
        : abs < 60
          ? fill(words.weeks, Math.round(abs / 7))
          : abs < 365
            ? fill(words.months, Math.round(abs / 30))
            : fill(abs >= 730 ? words.years : words.year, Math.round(abs / 365));
    return fill(days < 0 ? words.past : words.future, unit);
  };

  const number = (v: unknown) => {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? numFmt.format(n) : '';
  };

  const parts = (d: Date) => {
    const p = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
    return (t: string) => p.find((x) => x.type === t)?.value ?? '00';
  };

  return {
    date,
    time,
    dateTime: (v) => {
      const d = toDate(v);
      return d ? `${date(d)}, ${time(d)}` : '';
    },
    relative,
    money: (v, compact = false) => {
      if (v === null || v === undefined || v === '') return '';
      const n = Number(v);
      if (!Number.isFinite(n)) return '';
      return compact ? moneyCompactFmt.format(n) : moneyFmt.format(n);
    },
    number,
    plural: (n, one, many) => `${number(n)} ${n > 1 ? many : one}`,
    daysFromToday,
    dayKey,
    today,
    toDate,
    toLocalInput: (v) => {
      const d = toDate(v);
      if (!d) return '';
      const get = parts(d);
      const h = get('hour') === '24' ? '00' : get('hour');
      return `${get('year')}-${get('month')}-${get('day')}T${h}:${get('minute')}`;
    },
    fromLocalInput: (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    },
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

/** Initiales d'un nom (deux lettres au plus). */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase())
    .join('');
}
