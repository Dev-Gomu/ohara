import { diffStudy } from '../core/db/diff';
import type { Change, Diagnostics } from '../core/db/protocol';
import { fromRow } from '../core/db/rows';
import { SPECS } from '../core/db/specs';
import { orphanBlobs } from '../core/study/files';
import {
  addedBetween,
  nextTrash,
  removedBetween,
  type Trashed,
  type TrashItem,
} from '../core/study/trash';
import { EMPTY_STUDY } from '../core/study/create';
import type { Storage } from '../core/study/storage';
import type { StudyData } from '../core/study/types';
import type { DbClient, DbError } from './client';

export const WRITE_DELAY = 300;

export interface DbStorageOptions {
  pool: string;
  file: string;
  filesDir: string;
  persistent: boolean;
  // Chamado só em banco novo; no modo exemplo devolve os dados fictícios.
  initial: () => StudyData;
  onFatal: (error: DbError) => void;
}

function keyOf(change: Change): string {
  if (change.op === 'meta') return `meta:${change.key}`;
  if (change.op === 'device') return `device:${change.key}`;
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
  const opened = await client.open(options.pool, options.file, options.filesDir);
  const device = new Map(Object.entries(opened.deviceState));
  let mirror: StudyData = { ...EMPTY_STUDY };
  for (const spec of SPECS) {
    if (!spec.sync) continue;
    const rows = opened.snapshot[spec.table] ?? [];
    mirror = { ...mirror, [spec.collection]: rows.map((row) => fromRow(spec.table, row)) };
  }
  let trash: readonly Trashed[] = SPECS.filter((spec) => spec.sync).flatMap((spec) =>
    (opened.trash[spec.table] ?? []).map((row) => ({
      table: spec.table,
      item: fromRow<TrashItem>(spec.table, row),
      at: String(row.deleted_at ?? ''),
      by: String(row.deleted_by ?? row.id),
    })),
  );
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
  // Anexo na Lixeira ainda pode voltar: os bytes ficam até o Apagar de vez.
  const trashFiles = () =>
    trash.filter((entry) => entry.table === 'files').map((entry) => entry.item as unknown as StudyData['files'][number]);

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
    readTrash: () => trash,
    write(change, mark) {
      const next = change(mirror);
      if (next === mirror) return;
      const gone = removedBetween(mirror, next, mark, new Date().toISOString());
      const marks = new Map(gone.map((entry) => [`${entry.table}:${entry.item.id}`, entry]));
      const changes = diffStudy(mirror, next).map((item) => {
        const entry = item.op === 'delete' ? marks.get(`${item.table}:${item.id}`) : undefined;
        return entry && item.op === 'delete' ? { ...item, by: entry.by, at: entry.at } : item;
      });
      trash = nextTrash(trash, addedBetween(mirror, next), gone);
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
    async putBlob(sha256, bytes) {
      try {
        await client.putFile(sha256, bytes);
      } catch (error) {
        fail(error);
        throw error;
      }
    },
    getBlob: (sha256) => client.getFile(sha256),
    removeBlob: (sha256) => client.removeFile(sha256),
    getDeviceState: (key) => device.get(key),
    setDeviceState(key, value) {
      if (device.get(key) === value) return;
      device.set(key, value);
      const item: Change = { op: 'device', key, value };
      queue.set(keyOf(item), item);
      if (timer === undefined) timer = setTimeout(() => void flush(), WRITE_DELAY);
    },
    async loadLesson(lessonId) {
      await flush();
      const rows = await client.loadVersions(lessonId);
      const loaded = rows.map((row) =>
        fromRow<StudyData['noteVersions'][number]>('note_versions', row),
      );
      // Uma edição feita durante o carregamento já criou versão na memória, ainda fora destas linhas.
      const known = new Set(loaded.map((version) => version.id));
      const fresh = mirror.noteVersions.filter(
        (version) => version.lessonId === lessonId && !known.has(version.id),
      );
      mirror = { ...mirror, noteVersions: [...loaded, ...fresh] };
      notify();
    },
    async purge(items) {
      if (items.length === 0) return;
      const out = new Set(items);
      trash = trash.filter((entry) => !out.has(entry));
      for (const entry of items) {
        const item: Change = { op: 'purge', table: entry.table, id: entry.item.id };
        queue.set(`${entry.table}:${entry.item.id}`, item);
      }
      notify();
      await flush();
      const used = new Set([...mirror.files, ...trashFiles()].map((file) => file.sha256));
      for (const entry of items) {
        const sha = entry.table === 'files' ? String(entry.item.sha256) : '';
        if (sha !== '' && !used.has(sha)) await client.removeFile(sha);
      }
    },
    async sweepBlobs() {
      await flush();
      const orphans = orphanBlobs(await client.listFiles(), [...mirror.files, ...trashFiles()]);
      for (const name of orphans) await client.removeFile(name);
      return orphans.length;
    },
    async importDatabase(bytes) {
      await flush();
      return client.importDb(bytes);
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
