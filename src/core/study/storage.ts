import type { ImportCheck } from '../db/backup';
import type { Diagnostics } from '../db/protocol';
import { addedBetween, nextTrash, removedBetween, type Marker, type Trashed } from './trash';
import type { StudyData } from './types';

// A tela só conhece esta interface: o banco (data/) e a memória (testes) a implementam.
export interface Storage {
  read(): StudyData;
  // O que a escrita tirar vai à Lixeira; `mark` diz a raiz (sem ela, cada item é a própria raiz).
  write(change: (data: StudyData) => StudyData, mark?: Marker): void;
  // Lixeira (D164): o que foi excluído e ainda pode voltar. Restaurar é escrever o item de volta.
  readTrash(): readonly Trashed[];
  // Apagar de vez: lápide no banco e, se nada mais usa, os bytes do anexo saem do OPFS.
  purge(items: readonly Trashed[]): Promise<void>;
  subscribe(listener: () => void): () => void;
  // Falso quando os dados são de exemplo: a tela precisa avisar.
  readonly persistent: boolean;
  // Grava na hora o que está na fila (ao trocar de tela, ao ocultar o app, antes de sincronizar).
  flush(): Promise<void>;
  // Traz para o espelho as versões das Anotações da aula aberta.
  loadLesson(lessonId: string): Promise<void>;
  // Bytes dos anexos (PDF e imagem), fora do banco. Falha de gravação abre a tela de erro.
  putBlob(sha256: string, bytes: ArrayBuffer): Promise<void>;
  getBlob(sha256: string): Promise<ArrayBuffer | null>;
  removeBlob(sha256: string): Promise<void>;
  // Estado só deste aparelho (D28), como a página atual de cada aula.
  getDeviceState(key: string): string | undefined;
  setDeviceState(key: string, value: string): void;
  // Apaga os bytes que nenhum anexo vivo usa; devolve quantos arquivos saíram.
  sweepBlobs(): Promise<number>;
  // Troca o banco inteiro por um backup. Depois de 'ok', a página precisa recarregar.
  importDatabase(bytes: ArrayBuffer): Promise<ImportCheck | null>;
  exportDatabase(): Promise<Uint8Array | null>;
  diagnose(): Promise<Diagnostics | null>;
}

export function createMemoryStorage(initial: StudyData): Storage {
  let data = initial;
  let trash: readonly Trashed[] = [];
  const blobs = new Map<string, ArrayBuffer>();
  const device = new Map<string, string>();
  const listeners = new Set<() => void>();
  return {
    persistent: false,
    flush: () => Promise.resolve(),
    loadLesson: () => Promise.resolve(),
    putBlob: (sha256, bytes) => Promise.resolve(void blobs.set(sha256, bytes)),
    getBlob: (sha256) => Promise.resolve(blobs.get(sha256) ?? null),
    removeBlob: (sha256) => Promise.resolve(void blobs.delete(sha256)),
    getDeviceState: (key) => device.get(key),
    setDeviceState: (key, value) => void device.set(key, value),
    sweepBlobs: () => Promise.resolve(0),
    importDatabase: () => Promise.resolve(null),
    exportDatabase: () => Promise.resolve(null),
    diagnose: () => Promise.resolve(null),
    read: () => data,
    readTrash: () => trash,
    write(change, mark) {
      const next = change(data);
      trash = nextTrash(trash, addedBetween(data, next), removedBetween(data, next, mark, new Date().toISOString()));
      data = next;
      listeners.forEach((listener) => listener());
    },
    purge(items) {
      const out = new Set(items);
      trash = trash.filter((entry) => !out.has(entry));
      listeners.forEach((listener) => listener());
      return Promise.resolve();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
