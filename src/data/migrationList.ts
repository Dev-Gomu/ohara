import type { Migration } from '../core/db/migrations';
import first from './migrations/001_inicial.sql?raw';
import second from './migrations/002_arquivos.sql?raw';
import third from './migrations/003_notas.sql?raw';
import fourth from './migrations/004_faltas.sql?raw';
import fifth from './migrations/005_imagens.sql?raw';
import sixth from './migrations/006_lixeira.sql?raw';
import seventh from './migrations/007_fsrs.sql?raw';

export const MIGRATIONS: readonly Migration[] = [
  { version: 1, sql: first },
  { version: 2, sql: second },
  { version: 3, sql: third },
  { version: 4, sql: fourth },
  { version: 5, sql: fifth },
  { version: 6, sql: sixth },
  { version: 7, sql: seventh },
];
