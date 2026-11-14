import { SPECS, type TableName } from '../db/specs';
import type { StudyData } from './types';

// Lixeira (D164): o item fica 30 dias; nos últimos 7 a linha avisa quando some.
export const TRASH_DAYS = 30;
export const WARN_DAYS = 7;
const DAY_MS = 86_400_000;

export type TrashItem = { id: string } & Record<string, unknown>;

// Linha excluída: `by` é a raiz (o item que a pessoa excluiu); os filhos levados junto têm o mesmo `by`.
export interface Trashed {
  table: TableName;
  item: TrashItem;
  at: string;
  by: string;
}

export interface DeleteMark {
  by: string;
  at: string;
}

// Quem marca cada exclusão de uma escrita. Sem marca, o item é a própria raiz.
export type Marker = (table: TableName, id: string) => DeleteMark | undefined;

export const markAll =
  (by: string, at: string): Marker =>
  () => ({ by, at });

// Desfazer um restaurar: cada item volta à Lixeira com a raiz e a data que tinha.
export function markFrom(items: readonly Trashed[]): Marker {
  const known = new Map(items.map((entry) => [`${entry.table}:${entry.item.id}`, entry]));
  return (table, id) => known.get(`${table}:${id}`);
}

export function collectionOf(table: TableName): keyof StudyData {
  const spec = SPECS.find((item) => item.table === table);
  if (!spec) throw new Error(`Tabela desconhecida: ${table}`);
  return spec.collection;
}

const PARENTS: Readonly<Partial<Record<TableName, readonly (readonly [string, TableName])[]>>> = {
  subjects: [['yearId', 'years']],
  folders: [['subjectId', 'subjects']],
  lessons: [
    ['subjectId', 'subjects'],
    ['folderId', 'folders'],
  ],
  cards: [['lessonId', 'lessons']],
  exams: [['subjectId', 'subjects']],
  events: [
    ['subjectId', 'subjects'],
    ['lessonId', 'lessons'],
  ],
  slots: [['subjectId', 'subjects']],
  files: [
    ['lessonId', 'lessons'],
    ['subjectId', 'subjects'],
  ],
  attendance: [['subjectId', 'subjects']],
  card_images: [['lessonId', 'lessons']],
};

function parentsOf(entry: Trashed): { table: TableName; id: string }[] {
  return (PARENTS[entry.table] ?? [])
    .map(([field, table]) => ({ table, id: entry.item[field] }))
    .filter(
      (ref): ref is { table: TableName; id: string } => typeof ref.id === 'string' && ref.id !== '',
    );
}

export const groupOf = (trash: readonly Trashed[], root: string): Trashed[] =>
  trash.filter((entry) => entry.by === root);

// O que volta ao restaurar `root`: tudo que a exclusão levou e, se um pai também está na Lixeira,
// o grupo inteiro do pai (um cartão não volta para uma aula excluída).
export function restorePlan(trash: readonly Trashed[], root: string): Trashed[] {
  const byKey = new Map(trash.map((entry) => [`${entry.table}:${entry.item.id}`, entry]));
  const roots = new Set([root]);
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    for (const entry of groupOf(trash, current)) {
      for (const ref of parentsOf(entry)) {
        const parent = byKey.get(`${ref.table}:${ref.id}`);
        if (parent && !roots.has(parent.by)) {
          roots.add(parent.by);
          queue.push(parent.by);
        }
      }
    }
  }
  return trash.filter((entry) => roots.has(entry.by));
}

// Raízes que voltam junto além da pedida (para avisar: "restaurar o cartão restaura a aula").
export function extraRoots(trash: readonly Trashed[], root: string): Trashed[] {
  const roots = new Set(restorePlan(trash, root).map((entry) => entry.by));
  roots.delete(root);
  return trash.filter((entry) => roots.has(entry.by) && entry.item.id === entry.by);
}

export function withRestored(data: StudyData, items: readonly Trashed[]): StudyData {
  const next: Record<string, unknown> = { ...data };
  for (const entry of items) {
    const key = collectionOf(entry.table);
    const list = next[key] as readonly { id: string }[];
    if (!list.some((item) => item.id === entry.item.id)) next[key] = [...list, entry.item];
  }
  return next as unknown as StudyData;
}

export function withoutItems(data: StudyData, items: readonly Trashed[]): StudyData {
  const next: Record<string, unknown> = { ...data };
  for (const entry of items) {
    const key = collectionOf(entry.table);
    next[key] = (next[key] as readonly { id: string }[]).filter(
      (item) => item.id !== entry.item.id,
    );
  }
  return next as unknown as StudyData;
}

export function ageDays(at: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - Date.parse(at)) / DAY_MS));
}

export const daysLeft = (at: string, now: Date): number =>
  Math.max(0, TRASH_DAYS - ageDays(at, now));

// Limpeza ao abrir o app: o que passou dos 30 dias vira lápide.
export const expired = (trash: readonly Trashed[], now: Date): Trashed[] =>
  trash.filter((entry) => ageDays(entry.at, now) >= TRASH_DAYS);

// Atualiza a Lixeira em memória depois de uma escrita: o que voltou sai; o que saiu entra.
export function nextTrash(
  trash: readonly Trashed[],
  back: readonly { table: TableName; id: string }[],
  gone: readonly Trashed[],
): Trashed[] {
  const out = new Set(
    [...back, ...gone.map((entry) => ({ table: entry.table, id: entry.item.id }))].map(
      (ref) => `${ref.table}:${ref.id}`,
    ),
  );
  return [...trash.filter((entry) => !out.has(`${entry.table}:${entry.item.id}`)), ...gone];
}

// O que uma escrita tirou dos dados vivos (vai à Lixeira) e o que pôs de volta.
export function removedBetween(before: StudyData, after: StudyData, mark: Marker | undefined, at: string): Trashed[] {
  const gone: Trashed[] = [];
  for (const { table, collection, sync } of SPECS) {
    if (!sync || before[collection] === after[collection]) continue;
    const kept = new Set((after[collection] as readonly { id: string }[]).map((item) => item.id));
    for (const item of before[collection] as unknown as readonly TrashItem[]) {
      if (kept.has(item.id)) continue;
      const given = mark?.(table, item.id);
      gone.push({ table, item, at: given?.at ?? at, by: given?.by ?? item.id });
    }
  }
  return gone;
}

export function addedBetween(before: StudyData, after: StudyData): { table: TableName; id: string }[] {
  const back: { table: TableName; id: string }[] = [];
  for (const { table, collection, sync } of SPECS) {
    if (!sync || before[collection] === after[collection]) continue;
    const had = new Set((before[collection] as readonly { id: string }[]).map((item) => item.id));
    for (const item of after[collection] as readonly { id: string }[]) {
      if (!had.has(item.id)) back.push({ table, id: item.id });
    }
  }
  return back;
}
