// Mise en scène des stories d'application : un moteur complet sur l'adaptateur mémoire, une
// navigation en mémoire (la pile de fiches vit dans l'URL simulée) et une session fictive.
import * as React from 'react';
import { AppEngineProvider, createFormatters, createRegistry, type AppSession, type Navigation } from '../../src/app';
import { createMemoryDataSource, demoNow, demoObjects, type MemoryOptions } from '../../src/app/demo';
import type { DeepPartial, AppMessages } from '../../src/app/engine/messages';

export const demoSession: AppSession = {
  user: { id: 'm1', name: 'Camille Fontaine', email: 'camille@exemple.test' },
  orgs: [
    { id: 'o1', name: 'Atelier Nord' },
    { id: 'o2', name: 'Coopérative Sud' },
    { id: 'o3', name: 'Studio Est' },
  ],
  orgId: 'o1',
  roleLabel: 'Administratrice',
  scope: {
    value: 'all',
    options: [
      { value: 'me', label: 'Moi' },
      { value: 'all', label: 'Tout le monde' },
    ],
  },
  onSwitchOrg: () => undefined,
  onSignOut: () => undefined,
};

/** Navigation en mémoire : `push` met à jour un état local, `Link` est un `<a>` qui ne quitte pas la page. */
export function useMemoryNavigation(initial = '/projets'): Navigation {
  const [href, setHref] = React.useState(initial);
  return React.useMemo<Navigation>(() => {
    const url = new URL(href, 'http://demo.local');
    const go = (h: string) => setHref(h);
    return {
      pathname: url.pathname,
      searchParams: url.searchParams,
      push: go,
      replace: go,
      Link: ({ href: to, onClick, ...rest }) => (
        <a
          href={to}
          onClick={(e) => {
            e.preventDefault();
            onClick?.(e);
            go(to);
          }}
          {...rest}
        />
      ),
    };
  }, [href]);
}

export function DemoEngine({
  children,
  memory,
  messages,
  session = demoSession,
  initialPath = '/projets',
  storage,
}: {
  children: React.ReactNode;
  memory?: MemoryOptions;
  messages?: DeepPartial<AppMessages>;
  session?: AppSession | null;
  initialPath?: string;
  storage?: Parameters<typeof AppEngineProvider>[0]['config']['storage'];
}) {
  const registry = React.useMemo(() => createRegistry(demoObjects), []);
  const dataSource = React.useMemo(() => createMemoryDataSource({ registry, ...memory }), [registry, memory]);
  const formatters = React.useMemo(() => createFormatters({ now: demoNow }), []);
  const navigation = useMemoryNavigation(initialPath);
  const config = React.useMemo(
    () => ({ registry, dataSource, navigation, session: session ?? undefined, formatters, messages, storage }),
    [registry, dataSource, navigation, session, formatters, messages, storage],
  );
  return <AppEngineProvider config={config}>{children}</AppEngineProvider>;
}
