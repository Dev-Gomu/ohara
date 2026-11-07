import { formatHlc, parseHlc, tick } from '../core/db/hlc';
import { latestVersion, pending, type Migration } from '../core/db/migrations';
import type { Change, Diagnostics, OpenResult, Snapshot } from '../core/db/protocol';
import type { Row, SqlValue } from '../core/db/rows';
import { SPECS, specOf } from '../core/db/specs';

// Fatia mínima do SQLite que o app usa: o Worker e os testes em Node a implementam.
export interface SqlDb {
  run(sql: string, bind?: readonly SqlValue[]): void;
  all(sql: string, bind?: readonly SqlValue[]): Row[];
}

export class MigrationError extends Error {}

function inTransaction(db: SqlDb, work: () => void): void {
  db.run('BEGIN');
  try {
    work();
    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

export function schemaVersion(db: SqlDb): number {
  return Number(db.all('PRAGMA user_version')[0]?.user_version ?? 0);
}

export function migrate(db: SqlDb, all: readonly Migration[]): void {
  for (const migration of pending(all, schemaVersion(db))) {
    try {
      inTransaction(db, () => {
        db.run(migration.sql);
        db.run(`PRAGMA user_version = ${migration.version}`);
      });
    } catch (error) {
      throw new MigrationError(error instanceof Error ? error.message : String(error));
    }
  }
}

export function readMeta(db: SqlDb, key: string): string | null {
  const row = db.all('SELECT value FROM meta WHERE key = ?', [key])[0];
  return row ? String(row.value) : null;
}

function writeMeta(db: SqlDb, key: string, value: string): void {
  db.run('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', [
    key,
    value,
    value,
  ]);
}

export function ensureDevice(db: SqlDb, newId: () => string): string {
  const existing = readMeta(db, 'device_id');
  if (existing) return existing;
  const id = newId();
  writeMeta(db, 'device_id', id);
  return id;
}

function putSql(table: string, columns: readonly string[], sync: boolean): string {
  const all = sync ? [...columns, 'updated_at', 'deleted'] : [...columns];
  const marks = all.map(() => '?').join(', ');
  const updates = all.filter((name) => name !== 'id').map((name) => `${name} = excluded.${name}`);
  return `INSERT INTO ${table} (${all.join(', ')}) VALUES (${marks}) ON CONFLICT(id) DO UPDATE SET ${updates.join(', ')}`;
}

// Uma transação só: ou grava tudo, ou nada. O HLC avança a cada mudança e fica na mesma transação.
export function applyChanges(
  db: SqlDb,
  changes: readonly Change[],
  device: string,
  now: number,
): void {
  inTransaction(db, () => {
    let clock = parseHlc(readMeta(db, 'hlc'));
    for (const change of changes) {
      if (change.op === 'meta') {
        writeMeta(db, change.key, change.value);
        continue;
      }
      const spec = specOf(change.table);
      if (change.op === 'put') {
        const columns = ['id', ...spec.columns.map((column) => column.column)];
        const values = columns.map((name) => change.row[name] ?? null);
        if (!spec.sync) {
          db.run(putSql(spec.table, columns, false), values);
          continue;
        }
        clock = tick(clock, now);
        db.run(putSql(spec.table, columns, true), [...values, formatHlc(clock, device), 0]);
      } else if (!spec.sync) {
        db.run(`DELETE FROM ${spec.table} WHERE id = ?`, [change.id]);
      } else {
        clock = tick(clock, now);
        db.run(`UPDATE ${spec.table} SET deleted = 1, updated_at = ? WHERE id = ?`, [
          formatHlc(clock, device),
          change.id,
        ]);
      }
    }
    writeMeta(db, 'hlc', formatHlc(clock, device));
  });
}

export function loadSnapshot(db: SqlDb): Snapshot {
  const snapshot: Snapshot = {};
  for (const spec of SPECS) {
    if (!spec.sync) continue;
    snapshot[spec.table] = db.all(`SELECT * FROM ${spec.table} WHERE deleted = 0 ORDER BY rowid`);
  }
  return snapshot;
}

export function loadVersions(db: SqlDb, lessonId: string): Row[] {
  return db.all('SELECT * FROM note_versions WHERE lesson_id = ? ORDER BY at', [lessonId]);
}

export function diagnose(db: SqlDb, sqliteVersion: string, device: string): Diagnostics {
  const counts: Diagnostics['counts'] = {};
  for (const { table, sync } of SPECS) {
    const where = sync ? ' WHERE deleted = 0' : '';
    counts[table] = Number(db.all(`SELECT COUNT(*) AS n FROM ${table}${where}`)[0]?.n ?? 0);
  }
  return {
    sqliteVersion,
    schemaVersion: schemaVersion(db),
    deviceId: device,
    counts,
    persisted: null,
    usage: null,
    quota: null,
  };
}

export function openState(
  db: SqlDb,
  sqliteVersion: string,
  migrations: readonly Migration[],
  newId: () => string,
): OpenResult & { device: string } {
  migrate(db, migrations);
  if (schemaVersion(db) !== latestVersion(migrations)) {
    throw new MigrationError('Versão do banco diferente da esperada');
  }
  const device = ensureDevice(db, newId);
  return {
    snapshot: loadSnapshot(db),
    fresh: readMeta(db, 'seeded') === null,
    diagnostics: diagnose(db, sqliteVersion, device),
    device,
  };
}
