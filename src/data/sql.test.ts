import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { describe, expect, it } from 'vitest';
import { diffStudy } from '../core/db/diff';
import type { Change } from '../core/db/protocol';
import { fromRow, toRow, type Row } from '../core/db/rows';
import { SPECS } from '../core/db/specs';
import { createFixtures } from '../core/study/fixtures';
import type { StudyData } from '../core/study/types';
import { MIGRATIONS } from './migrationList';
import {
  applyChanges,
  loadSnapshot,
  loadVersions,
  migrate,
  openState,
  schemaVersion,
  type SqlDb,
} from './sql';

async function memoryDb(): Promise<SqlDb> {
  const sqlite3 = await sqlite3InitModule();
  const raw = new sqlite3.oo1.DB(':memory:');
  return {
    run: (sql, bind) => void raw.exec({ sql, bind: bind ? [...bind] : undefined }),
    all: (sql, bind) =>
      raw.exec({
        sql,
        bind: bind ? [...bind] : undefined,
        rowMode: 'object',
        returnValue: 'resultRows',
      }) as Row[],
  };
}

const empty: StudyData = {
  years: [],
  subjects: [],
  folders: [],
  lessons: [],
  cards: [],
  exams: [],
  events: [],
  slots: [],
  reminders: [],
  noteVersions: [],
};

const seed = createFixtures('2026-11-07');

describe('SQL (SQLite em memória)', () => {
  it('a migração 001 cria tudo e é idempotente', async () => {
    const db = await memoryDb();
    migrate(db, MIGRATIONS);
    migrate(db, MIGRATIONS);
    expect(schemaVersion(db)).toBe(1);
  });

  it('ida e volta das nove tabelas e das versões', async () => {
    const db = await memoryDb();
    const state = openState(db, 'x', MIGRATIONS, () => 'dev');
    expect(state.fresh).toBe(true);
    const data: StudyData = {
      ...seed,
      noteVersions: [{ id: 'v1', lessonId: seed.lessons[0]?.id ?? '', at: 10, html: '<p>a</p>' }],
    };
    applyChanges(db, diffStudy(empty, data), 'dev', 1000);
    const snapshot = loadSnapshot(db);
    for (const spec of SPECS.filter((item) => item.sync)) {
      const items = (data[spec.collection] as { id: string }[]).map((item) => ({ ...item }));
      const loaded = (snapshot[spec.table] ?? []).map((row) => fromRow(spec.table, row));
      expect(loaded).toEqual(items);
    }
    const versions = loadVersions(db, seed.lessons[0]?.id ?? '');
    expect(versions.map((row) => fromRow('note_versions', row))).toEqual(data.noteVersions);
  });

  it('exclusão é lógica nas tabelas que sincronizam e real nas versões', async () => {
    const db = await memoryDb();
    migrate(db, MIGRATIONS);
    const card = seed.cards[0];
    if (!card) throw new Error('sem cartão');
    const put: Change[] = [
      { op: 'put', table: 'cards', row: toRow('cards', card) },
      {
        op: 'put',
        table: 'note_versions',
        row: toRow('note_versions', { id: 'v', lessonId: 'a', at: 1, html: 'h' }),
      },
    ];
    applyChanges(db, put, 'dev', 1000);
    applyChanges(
      db,
      [
        { op: 'delete', table: 'cards', id: card.id },
        { op: 'delete', table: 'note_versions', id: 'v' },
      ],
      'dev',
      2000,
    );
    expect(loadSnapshot(db).cards).toEqual([]);
    const kept = db.all('SELECT deleted, updated_at FROM cards');
    expect(kept[0]?.deleted).toBe(1);
    expect(String(kept[0]?.updated_at)).toMatch(/^0000000002000-/);
    expect(loadVersions(db, 'a')).toEqual([]);
  });

  it('put em linha apagada traz de volta e o HLC nunca anda para trás', async () => {
    const db = await memoryDb();
    migrate(db, MIGRATIONS);
    const card = seed.cards[0];
    if (!card) throw new Error('sem cartão');
    const row = toRow('cards', card);
    applyChanges(db, [{ op: 'put', table: 'cards', row }], 'dev', 5000);
    applyChanges(db, [{ op: 'delete', table: 'cards', id: card.id }], 'dev', 1000);
    applyChanges(db, [{ op: 'put', table: 'cards', row }], 'dev', 1000);
    expect(loadSnapshot(db).cards).toHaveLength(1);
    const stamp = String(db.all('SELECT updated_at FROM cards')[0]?.updated_at);
    expect(stamp > '0000000005000-0001').toBe(true);
  });

  it('transação desfeita se uma mudança falha', async () => {
    const db = await memoryDb();
    migrate(db, MIGRATIONS);
    const card = seed.cards[0];
    if (!card) throw new Error('sem cartão');
    const bad: Row = { ...toRow('cards', card), question: null };
    expect(() =>
      applyChanges(
        db,
        [
          { op: 'put', table: 'cards', row: toRow('cards', card) },
          { op: 'put', table: 'cards', row: bad },
        ],
        'dev',
        1,
      ),
    ).toThrow();
    expect(db.all('SELECT * FROM cards')).toEqual([]);
  });
});
