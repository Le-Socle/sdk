// Point d'entrée « app » : composants d'application, coque et moteur d'écrans par métadonnées.
// Aucune valeur de marque ici : tout vient des jetons (voir AGENTS.md). Aucun import de next/* ni
// appel réseau : l'hôte fournit source de données, navigation, session, textes et icônes à
// `AppEngineProvider`.
export const etage = { support: 'app', statut: 'actif' } as const;
export type Etage = typeof etage;

// Moteur : types, registre, évaluation des filtres et tris, formats, textes.
export * from './engine/index';
export type { AppSession, AppOrg, AppUser, DataSource, EngineSlots, IconComponent, IconSet, KeyValueStore, ListQuery, Member, Navigation, Notifier, Ref, SavedView, Tag } from './engine/contracts';
export { AppEngineProvider, createLocalStore, createMemoryStore, useAppMessages, useDataSource, useFieldOptions, useFormatters, useIcons, useInvalidate, useNavigation, useNotifier, useRegistry, useSession, useSlots, useStore, type AppEngineConfig } from './engine/provider';
export { useAsync, useDebounced, type AsyncState } from './engine/use-async';
export { useMutation, type MutationOptions } from './engine/use-mutation';

// Composants.
export { AppShell, OrgSwitcher, PageContent, PageHeader, ScopeSwitch, SearchButton, type AppShellProps, type Crumb, type NavGroup, type NavItem } from './components/shell';
export { EmptyState, ErrorState, LoadingRows } from './components/states';
export { StatBand, type StatItem } from './components/stat-band';
export { DataTable, type ColumnSpec, type DataTableProps } from './components/data-table';
export { FilterBar, ME } from './components/filter-bar';
export { BulkBar } from './components/bulk-bar';
export { ObjectList } from './components/object-list';
export { Dot, Pill } from './components/pill';
export { UserAvatar } from './components/user-avatar';
export { Icon, baseIcons, useIcon } from './components/icons';
export { toneOf, type Tone } from './components/tints';

// Champs et fiche.
export { FieldDisplay, RecordChip, SelectValueView, SignalList, TagList, TagPill, type DisplayVariant, type SignalValue } from './fields/field-display';
export { FieldEditor, type FieldEditorProps } from './fields/field-editor';
export { EditableField } from './fields/editable-field';
export { RelationPicker, MEMBER, type Picked } from './fields/relation-picker';
export { TagPicker, useTags } from './fields/tag-picker';
export { RecordDrawerHost, resolveSectionFilters } from './drawer/record-drawer';
export { parseStack, serializeStack, useDrawer, useDrawerMode, type DrawerEntry, type DrawerMode } from './drawer/use-drawer';
