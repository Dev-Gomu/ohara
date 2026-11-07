import type { Migration } from '../core/db/migrations';
import first from './migrations/001_inicial.sql?raw';
import second from './migrations/002_arquivos.sql?raw';
import third from './migrations/003_notas.sql?raw';
import fourth from './migrations/004_faltas.sql?raw';

export const MIGRATIONS: readonly Migration[] = [
  { version: 1, sql: first },
  { version: 2, sql: second },
  { version: 3, sql: third },
  { version: 4, sql: fourth },
];
