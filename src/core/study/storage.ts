import type { StudyData } from './types';

// O banco da Etapa 7 implementa esta mesma interface: as telas não mudam.
export interface Storage {
  read(): StudyData;
  write(change: (data: StudyData) => StudyData): void;
  subscribe(listener: () => void): () => void;
  // Falso enquanto os dados só existem em memória: a tela precisa avisar.
  readonly persistent: boolean;
}

export function createMemoryStorage(initial: StudyData): Storage {
  let data = initial;
  const listeners = new Set<() => void>();
  return {
    persistent: false,
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
