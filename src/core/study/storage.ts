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
  exportDatabase(): Promise<Uint8Array | null>;
  diagnose(): Promise<Diagnostics | null>;
}

export function createMemoryStorage(initial: StudyData): Storage {
  let data = initial;
  const listeners = new Set<() => void>();
  return {
    persistent: false,
    flush: () => Promise.resolve(),
    loadLesson: () => Promise.resolve(),
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
