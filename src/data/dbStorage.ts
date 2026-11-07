import { diffStudy } from '../core/db/diff';
import type { Change, Diagnostics } from '../core/db/protocol';
import { fromRow } from '../core/db/rows';
import { SPECS } from '../core/db/specs';
import { EMPTY_STUDY } from '../core/study/create';
import type { Storage } from '../core/study/storage';
import type { StudyData } from '../core/study/types';
import type { DbClient, DbError } from './client';

export const WRITE_DELAY = 300;

export interface DbStorageOptions {
  pool: string;
  file: string;
  persistent: boolean;
  // Chamado só em banco novo; no modo exemplo devolve os dados fictícios.
  initial: () => StudyData;
  onFatal: (error: DbError) => void;
}

function keyOf(change: Change): string {
  if (change.op === 'meta') return `meta:${change.key}`;
  return `${change.table}:${change.op === 'put' ? String(change.row.id) : change.id}`;
}

async function storageEstimate(): Promise<Pick<Diagnostics, 'persisted' | 'usage' | 'quota'>> {
  const manager = navigator.storage as StorageManager | undefined;
  if (!manager) return { persisted: null, usage: null, quota: null };
  const [persisted, estimate] = await Promise.all([
    manager.persisted?.().catch(() => null) ?? null,
    manager.estimate?.().catch(() => null) ?? null,
  ]);
  return { persisted, usage: estimate?.usage ?? null, quota: estimate?.quota ?? null };
}

export async function createDbStorage(
  client: DbClient,
  options: DbStorageOptions,
): Promise<Storage> {
  const opened = await client.open(options.pool, options.file);
  let mirror: StudyData = { ...EMPTY_STUDY };
  for (const spec of SPECS) {
    if (!spec.sync) continue;
    const rows = opened.snapshot[spec.table] ?? [];
    mirror = { ...mirror, [spec.collection]: rows.map((row) => fromRow(spec.table, row)) };
  }
  if (opened.fresh) {
    const initial = options.initial();
    const changes: Change[] = [
      ...diffStudy(EMPTY_STUDY, initial),
      { op: 'meta', key: 'seeded', value: '1' },
    ];
    await client.apply(changes);
    mirror = initial;
  }

  const listeners = new Set<() => void>();
  const queue = new Map<string, Change>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let chain: Promise<void> = Promise.resolve();
  let failed = false;

  const notify = () => listeners.forEach((listener) => listener());

  function fail(error: unknown) {
    if (failed) return;
    failed = true;
    options.onFatal(error as DbError);
  }

  function flush(): Promise<void> {
    clearTimeout(timer);
    timer = undefined;
    if (queue.size > 0) {
      const batch = [...queue.values()];
      queue.clear();
      chain = chain.then(() => client.apply(batch)).catch(fail);
    }
    return chain;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('pagehide', () => void flush());

  return {
    persistent: options.persistent,
    read: () => mirror,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    write(change) {
      const next = change(mirror);
      if (next === mirror) return;
      const changes = diffStudy(mirror, next);
      mirror = next;
      for (const item of changes) {
        const key = keyOf(item);
        queue.delete(key);
        queue.set(key, item);
      }
      if (queue.size > 0 && timer === undefined)
        timer = setTimeout(() => void flush(), WRITE_DELAY);
      notify();
    },
    flush,
    async loadLesson(lessonId) {
      await flush();
      const rows = await client.loadVersions(lessonId);
      mirror = {
        ...mirror,
        noteVersions: rows.map((row) =>
          fromRow<StudyData['noteVersions'][number]>('note_versions', row),
        ),
      };
      notify();
    },
    async exportDatabase() {
      await flush();
      return client.exportFile();
    },
    async diagnose() {
      await flush();
      const base = await client.diagnose();
      return { ...base, ...(await storageEstimate()) };
    },
  };
}
