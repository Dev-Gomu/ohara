import { specOf, type ColumnKind, type TableName } from './specs';

export type SqlValue = string | number | null;
export type Row = Record<string, SqlValue>;

function encode(kind: ColumnKind, value: unknown): SqlValue {
  if (kind === 'bool') return value ? 1 : 0;
  if (kind === 'text?') return value == null ? null : String(value);
  if (kind === 'num') return Number(value);
  return String(value ?? '');
}

function decode(kind: ColumnKind, value: SqlValue | undefined): unknown {
  if (kind === 'bool') return value === 1 || value === '1';
  if (kind === 'text?') return value == null ? null : String(value);
  if (kind === 'num') return Number(value);
  return String(value ?? '');
}

export function toRow(table: TableName, item: object): Row {
  const source = item as Record<string, unknown>;
  const row: Row = { id: String(source.id) };
  for (const { field, column, kind } of specOf(table).columns) {
    row[column] = encode(kind, source[field]);
  }
  return row;
}

export function fromRow<T>(table: TableName, row: Row): T {
  const item: Record<string, unknown> = { id: String(row.id) };
  for (const { field, column, kind } of specOf(table).columns) {
    item[field] = decode(kind, row[column]);
  }
  return item as T;
}
