import type { StudyData } from '../study/types';

export type ColumnKind = 'text' | 'num' | 'bool' | 'text?';

export interface Column {
  field: string;
  column: string;
  kind: ColumnKind;
}

export type TableName =
  | 'years'
  | 'subjects'
  | 'folders'
  | 'lessons'
  | 'cards'
  | 'exams'
  | 'events'
  | 'slots'
  | 'reminders'
  | 'note_versions';

export interface TableSpec {
  table: TableName;
  collection: keyof StudyData;
  columns: readonly Column[];
  // Falso: fica no aparelho, é apagada de verdade e não sincroniza (D85).
  sync: boolean;
}

const text = (field: string, column = toSnake(field)): Column => ({ field, column, kind: 'text' });
const optional = (field: string): Column => ({ field, column: toSnake(field), kind: 'text?' });
const num = (field: string, column = toSnake(field)): Column => ({ field, column, kind: 'num' });
const bool = (field: string): Column => ({ field, column: toSnake(field), kind: 'bool' });

export function toSnake(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// "order", "start" e "end" colidem com palavras do SQL: ganham outro nome de coluna.
export const SPECS: readonly TableSpec[] = [
  {
    table: 'years',
    collection: 'years',
    sync: true,
    columns: [text('name'), bool('archived')],
  },
  {
    table: 'subjects',
    collection: 'subjects',
    sync: true,
    columns: [text('yearId'), text('name'), text('code'), num('color'), optional('lastAccess')],
  },
  {
    table: 'folders',
    collection: 'folders',
    sync: true,
    columns: [text('subjectId'), text('name'), num('order', 'sort_order')],
  },
  {
    table: 'lessons',
    collection: 'lessons',
    sync: true,
    columns: [
      text('subjectId'),
      optional('folderId'),
      text('title'),
      text('date'),
      num('slides'),
      text('notes'),
    ],
  },
  {
    table: 'cards',
    collection: 'cards',
    sync: true,
    columns: [text('lessonId'), text('question'), text('answer'), text('due')],
  },
  {
    table: 'exams',
    collection: 'exams',
    sync: true,
    columns: [text('subjectId'), text('date'), text('time')],
  },
  {
    table: 'events',
    collection: 'events',
    sync: true,
    columns: [
      text('kind'),
      text('subjectId'),
      optional('lessonId'),
      text('title'),
      text('date'),
      text('start', 'start_time'),
      text('end', 'end_time'),
    ],
  },
  {
    table: 'slots',
    collection: 'slots',
    sync: true,
    columns: [
      text('subjectId'),
      num('weekday'),
      text('start', 'start_time'),
      text('end', 'end_time'),
      num('every'),
      text('anchor'),
      text('label'),
      text('room'),
    ],
  },
  {
    table: 'reminders',
    collection: 'reminders',
    sync: true,
    columns: [text('text'), text('date'), bool('done')],
  },
  {
    table: 'note_versions',
    collection: 'noteVersions',
    sync: false,
    columns: [text('lessonId'), num('at'), text('html')],
  },
];

export function specOf(table: TableName): TableSpec {
  const found = SPECS.find((spec) => spec.table === table);
  if (!found) throw new Error(`Tabela desconhecida: ${table}`);
  return found;
}
