import type { Migration } from '../core/db/migrations';
import first from './migrations/001_inicial.sql?raw';

export const MIGRATIONS: readonly Migration[] = [{ version: 1, sql: first }];
