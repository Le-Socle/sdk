'use client';

import * as React from 'react';
import type { DataSource, EngineSlots, IconSet, KeyValueStore, Navigation, Notifier, AppSession } from './contracts';
import { createFormatters, type Formatters } from './formatters';
import { appMessagesFr, mergeMessages, type AppMessages, type DeepPartial } from './messages';
import type { ObjectRegistry } from './registry';
import type { FieldDef, SelectOption } from './types';
import { baseIcons } from '../components/icons';
import { useAsync } from './use-async';

export interface AppEngineConfig {
  registry: ObjectRegistry;
  dataSource: DataSource;
  /** Absente : la pile de fiches reste en mémoire au lieu d'être dans l'URL. */
  navigation?: Navigation;
  session?: AppSession;
  messages?: DeepPartial<AppMessages>;
  formatters?: Formatters;
  icons?: IconSet;
  storage?: KeyValueStore;
  notifier?: Notifier;
  slots?: EngineSlots;
}

interface EngineValue {
  registry: ObjectRegistry;
  dataSource: DataSource;
  navigation: Navigation | null;
  session: AppSession | null;
  messages: AppMessages;
  formatters: Formatters;
  icons: IconSet;
  storage: KeyValueStore;
  notifier: Notifier;
  slots: EngineSlots;
  /** Compteur qui monte à chaque écriture : les lectures se rechargent. */
  version: number;
  invalidate(): void;
  /** Pile de fiches gardée en mémoire quand il n'y a pas de navigation. */
  memoryStack: string;
  setMemoryStack(v: string): void;
  optionSources: Record<string, SelectOption[]>;
}

const EngineContext = React.createContext<EngineValue | null>(null);
const NO_SOURCES: Record<string, SelectOption[]> = {};

/** Stockage protégé : `localStorage` quand il existe, sinon la mémoire de la page. */
export function createLocalStore(prefix = 'app'): KeyValueStore {
  const memory = new Map<string, string>();
  return {
    get(key) {
      try {
        return window.localStorage.getItem(`${prefix}:${key}`);
      } catch {
        return memory.get(key) ?? null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(`${prefix}:${key}`, value);
      } catch {
        memory.set(key, value);
      }
    },
  };
}

export function createMemoryStore(): KeyValueStore {
  const m = new Map<string, string>();
  return { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v) };
}

const silentNotifier: Notifier = { success: () => undefined, error: () => undefined };

/**
 * Fournit au moteur tout ce que l'application doit lui donner : objets, source de données,
 * navigation, session, textes, formats, icônes, stockage, notifications, extensions.
 * Les composants d'application ne lisent rien d'autre. Les écritures (`useInvalidate`) rechargent
 * toutes les lectures.
 */
export function AppEngineProvider({ config, children }: { config: AppEngineConfig; children: React.ReactNode }) {
  const [version, setVersion] = React.useState(0);
  const [memoryStack, setMemoryStack] = React.useState('');
  const invalidate = React.useCallback(() => setVersion((v) => v + 1), []);
  const messages = React.useMemo(() => mergeMessages(appMessagesFr, config.messages), [config.messages]);
  const formatters = React.useMemo(() => config.formatters ?? createFormatters(), [config.formatters]);
  const icons = React.useMemo(() => ({ ...baseIcons, ...config.icons }), [config.icons]);
  const fallbackStore = React.useMemo(() => createMemoryStore(), []);
  const base = React.useMemo(
    () => ({
      registry: config.registry,
      dataSource: config.dataSource,
      navigation: config.navigation ?? null,
      session: config.session ?? null,
      messages,
      formatters,
      icons,
      storage: config.storage ?? fallbackStore,
      notifier: config.notifier ?? silentNotifier,
      slots: config.slots ?? {},
      version,
      invalidate,
      memoryStack,
      setMemoryStack,
    }),
    [config, messages, formatters, icons, fallbackStore, version, invalidate, memoryStack],
  );
  return (
    <EngineContext.Provider value={{ ...base, optionSources: NO_SOURCES }}>
      <SourcesLoader base={base}>{children}</SourcesLoader>
    </EngineContext.Provider>
  );
}

/** Charge une fois les listes d'options nommées (`optionSources`) et les met à disposition de tous les champs. */
function SourcesLoader({ base, children }: { base: Omit<EngineValue, 'optionSources'>; children: React.ReactNode }) {
  const ds = base.dataSource;
  const sources = useAsync(() => (ds.optionSources ? ds.optionSources() : Promise.resolve(NO_SOURCES)), [ds]);
  const value = React.useMemo(() => ({ ...base, optionSources: sources.data ?? NO_SOURCES }), [base, sources.data]);
  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

function useEngine(): EngineValue {
  const v = React.useContext(EngineContext);
  if (!v) throw new Error('Ce composant doit être posé dans un AppEngineProvider.');
  return v;
}

export const useRegistry = () => useEngine().registry;
export const useDataSource = () => useEngine().dataSource;
export const useNavigation = () => useEngine().navigation;
export const useSession = () => useEngine().session;
export const useAppMessages = () => useEngine().messages;
export const useFormatters = () => useEngine().formatters;
export const useIcons = () => useEngine().icons;
export const useStore = () => useEngine().storage;
export const useNotifier = () => useEngine().notifier;
export const useSlots = () => useEngine().slots;
export const useEngineVersion = () => useEngine().version;
export const useInvalidate = () => useEngine().invalidate;
export const useMemoryStack = () => {
  const e = useEngine();
  return [e.memoryStack, e.setMemoryStack] as const;
};

/** Options d'un champ : les siennes, sinon la liste nommée de la source de données. */
export function useFieldOptions(field: Pick<FieldDef, 'options' | 'optionsSource'>): SelectOption[] | undefined {
  const sources = useEngine().optionSources;
  return field.options ?? (field.optionsSource ? sources[field.optionsSource] : undefined);
}

/** Vrai quand le composant est dans un AppEngineProvider. */
export function useHasEngine(): boolean {
  return React.useContext(EngineContext) !== null;
}
