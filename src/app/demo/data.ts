// Données de démonstration : fictives, génériques, sans marque. Les dates sont fixes (octobre 2026)
// pour que les stories et les tests donnent toujours le même rendu ; `demoNow` est la date
// de référence à passer à `createFormatters({ now })`.
import type { Member, Ref, Tag } from '../engine/contracts';
import type { Row } from '../engine/query';

export const demoNow = () => new Date('2026-10-22T09:00:00+02:00');

export const demoMembers: Member[] = [
  { id: 'm1', label: 'Camille Fontaine', email: 'camille@exemple.test' },
  { id: 'm2', label: 'Louis Marchand', email: 'louis@exemple.test' },
  { id: 'm3', label: 'Inès Rousseau', email: 'ines@exemple.test' },
];

const tag = (id: string, label: string, tint: string): Tag => ({ id, label, color: tint });

export const demoTags: Tag[] = [tag('t1', 'Stratégique', 'violet'), tag('t2', 'Urgent', 'red'), tag('t3', 'Interne', 'gray'), tag('t4', 'Pilote', 'teal')];

const t = (...ids: string[]) => ids.map((id) => demoTags.find((x) => x.id === id)!);
const m = (id: string): Ref => {
  const x = demoMembers.find((y) => y.id === id)!;
  return { id: x.id, label: x.label };
};

const names = [
  'Refonte du portail client',
  'Migration de l’espace de stockage',
  'Programme de formation interne',
  'Audit de sécurité annuel',
  'Déploiement du tableau de bord financier',
  'Nouvelle charte d’accueil',
  'Automatisation des relances',
  'Étude d’implantation régionale avec un nom volontairement très long pour vérifier la troncature',
  'Plateforme de réservation',
  'Optimisation des achats',
  'Catalogue de services',
  'Passage à la facturation électronique',
  'Mise à niveau du réseau',
  'Enquête de satisfaction',
  'Outil de planification des équipes',
  'Revue des contrats cadres',
];
const statuses = ['active', 'active', 'review', 'idea', 'blocked', 'done', 'active', 'idea'];
const priorities = ['normal', 'high', 'low', 'normal', 'high', 'normal'];

export const demoPeople: Row[] = [
  { id: 'p1', name: 'Hélène Dubois', role: 'lead', email: ['helene.dubois@exemple.test'], phone: ['+33 1 23 45 67 89'], active: true, project_ids: [{ id: 'j1', label: names[0]! }, { id: 'j3', label: names[2]! }], skills: ['Pilotage', 'Négociation'], since: '2023-03-14', tags: t('t1') },
  { id: 'p2', name: 'Mathieu Lambert', role: 'member', email: ['mathieu.lambert@exemple.test', 'm.lambert@exemple.test'], phone: [], active: true, project_ids: [{ id: 'j2', label: names[1]! }], skills: ['Infrastructure'], since: '2024-01-08', tags: [] },
  { id: 'p3', name: 'Sophie Girard', role: 'member', email: ['sophie.girard@exemple.test'], phone: ['+33 6 12 34 56 78'], active: true, project_ids: [], skills: [], since: '2022-09-01', tags: t('t3', 't4') },
  { id: 'p4', name: 'Antoine Perrin', role: 'guest', email: [], phone: [], active: false, project_ids: [], skills: ['Audit'], since: '2025-05-20', tags: [] },
  { id: 'p5', name: 'Clara Vidal', role: 'lead', email: ['clara.vidal@exemple.test'], phone: ['+33 6 98 76 54 32'], active: true, project_ids: [{ id: 'j4', label: names[3]! }], skills: ['Sécurité', 'Conformité', 'Formation'], since: '2021-11-30', tags: t('t1', 't2') },
  { id: 'p6', name: 'Julien Moreau', role: 'member', email: ['julien.moreau@exemple.test'], phone: [], active: true, project_ids: [], skills: [], since: '2024-06-03', tags: [] },
];

export const demoProjects: Row[] = names.map((name, i) => {
  const status = statuses[i % statuses.length]!;
  const due = `2026-${String(9 + ((i + 1) % 4)).padStart(2, '0')}-${String(3 + ((i * 5) % 25)).padStart(2, '0')}`;
  const late = status !== 'done' && due < '2026-10-22';
  const client = demoPeople[i % demoPeople.length]!;
  return {
    id: `j${i + 1}`,
    name,
    status,
    priority: priorities[i % priorities.length]!,
    owner: m(demoMembers[i % demoMembers.length]!.id),
    owner_id: demoMembers[i % demoMembers.length]!.id,
    client: i % 5 === 4 ? null : { id: client.id, label: String(client.name), object: 'person' },
    client_id: i % 5 === 4 ? null : client.id,
    budget: status === 'idea' ? null : 12000 + ((i * 7919) % 90000) + (i % 3) * 0.5,
    progress: status === 'done' ? 100 : status === 'idea' ? 0 : (i * 17) % 95,
    due,
    late,
    updated_at: `2026-10-${String(1 + ((i * 3) % 21)).padStart(2, '0')}T10:30:00+02:00`,
    links: i % 4 === 0 ? `https://exemple.test/projets/${i + 1}` : null,
    notes: i % 3 === 0 ? 'Point hebdomadaire le lundi. Décision attendue du comité avant la fin du mois.' : '',
    tags: i % 4 === 0 ? t('t1') : i % 4 === 1 ? t('t2', 't3') : i % 4 === 2 ? t('t4') : [],
  };
});

export const demoRows: Record<string, Row[]> = { project: demoProjects, person: demoPeople };
