import type { Row } from './rows';
import type { TableName } from './specs';

export type DbErrorCode =
  | 'outra-aba'
  | 'opfs-indisponivel'
  | 'cota'
  | 'migracao'
  | 'corrompido'
  | 'gravacao'
  | 'desconhecido';

export interface DbFailure {
  code: DbErrorCode;
  message: string;
}

export type Change =
  | { op: 'put'; table: TableName; row: Row }
  | { op: 'delete'; table: TableName; id: string }
  | { op: 'meta'; key: string; value: string };

export interface Diagnostics {
  sqliteVersion: string;
  schemaVersion: number;
  deviceId: string;
  counts: Partial<Record<TableName, number>>;
  persisted: boolean | null;
  usage: number | null;
  quota: number | null;
}

export type Snapshot = Partial<Record<TableName, Row[]>>;

export interface OpenResult {
  snapshot: Snapshot;
  // Banco que nunca recebeu dados iniciais.
  fresh: boolean;
  diagnostics: Diagnostics;
}

export type Request =
  | { type: 'open'; pool: string; file: string }
  | { type: 'apply'; changes: Change[] }
  | { type: 'loadVersions'; lessonId: string }
  | { type: 'export' }
  | { type: 'diagnose' };

export interface ResultMap {
  open: OpenResult;
  apply: null;
  loadVersions: Row[];
  export: Uint8Array;
  diagnose: Diagnostics;
}

export type Envelope = { id: number; request: Request };

export type Reply =
  | { id: number; ok: true; result: ResultMap[Request['type']] }
  | { id: number; ok: false; error: DbFailure };
