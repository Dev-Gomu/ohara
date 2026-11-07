/// <reference lib="webworker" />
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { classifyError, type Phase } from '../core/db/errors';
import type { Envelope, Reply, Request, ResultMap } from '../core/db/protocol';
import type { Row } from '../core/db/rows';
import { MIGRATIONS } from './migrationList';
import { applyChanges, diagnose, loadVersions, MigrationError, openState, type SqlDb } from './sql';

interface Opened {
  db: SqlDb;
  device: string;
  version: string;
}

let opened: Opened | null = null;
// Fica pronto assim que o pool existe, para o export funcionar mesmo se a migração falhar.
let exportBytes: (() => Uint8Array) | null = null;

async function open(request: Extract<Request, { type: 'open' }>): Promise<ResultMap['open']> {
  const sqlite3 = await sqlite3InitModule();
  const pool = await sqlite3.installOpfsSAHPoolVfs({
    name: request.pool,
    directory: `.${request.pool}`,
  });
  const path = `/${request.file}`;
  exportBytes = () => pool.exportFile(path);
  const raw = new pool.OpfsSAHPoolDb(path);
  const db: SqlDb = {
    run: (sql, bind) => void raw.exec({ sql, bind: bind ? [...bind] : undefined }),
    all: (sql, bind) =>
      raw.exec({
        sql,
        bind: bind ? [...bind] : undefined,
        rowMode: 'object',
        returnValue: 'resultRows',
      }) as Row[],
  };
  db.run('PRAGMA foreign_keys = ON');
  const state = openState(db, sqlite3.version.libVersion, MIGRATIONS, () => crypto.randomUUID());
  opened = { db, device: state.device, version: sqlite3.version.libVersion };
  return { snapshot: state.snapshot, fresh: state.fresh, diagnostics: state.diagnostics };
}

function ready(): Opened {
  if (!opened) throw new Error('Banco ainda não foi aberto');
  return opened;
}

async function handle(request: Request): Promise<ResultMap[Request['type']]> {
  switch (request.type) {
    case 'open':
      return open(request);
    case 'apply': {
      const { db, device } = ready();
      applyChanges(db, request.changes, device, Date.now());
      return null;
    }
    case 'loadVersions':
      return loadVersions(ready().db, request.lessonId);
    case 'export': {
      if (!exportBytes) throw new Error('Banco ainda não foi aberto');
      return exportBytes();
    }
    case 'diagnose': {
      const { db, version, device } = ready();
      return diagnose(db, version, device);
    }
  }
}

function phaseOf(request: Request, error: unknown): Phase {
  if (error instanceof MigrationError) return 'migracao';
  return request.type === 'apply' ? 'gravacao' : 'abertura';
}

self.onmessage = (event: MessageEvent<Envelope>) => {
  const { id, request } = event.data;
  handle(request).then(
    (result) => {
      const reply: Reply = { id, ok: true, result };
      self.postMessage(reply);
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      const name = error instanceof Error ? error.name : '';
      const reply: Reply = {
        id,
        ok: false,
        error: { code: classifyError(message, name, phaseOf(request, error)), message },
      };
      self.postMessage(reply);
    },
  );
};
