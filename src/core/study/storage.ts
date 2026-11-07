import type { ImportCheck } from '../db/backup';
import type { Diagnostics } from '../db/protocol';
import type { StudyData } from './types';

// A tela só conhece esta interface: o banco (data/) e a memória (testes) a implementam.
export interface Storage {
  read(): StudyData;
  write(change: (data: StudyData) => StudyData): void;
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
    write(change) {
      data = change(data);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
