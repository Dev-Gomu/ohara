import { useSyncExternalStore } from 'react';
import { prefixed } from '../../core/appInfo';

// Preferência de aparelho, como o tema: sem armazenamento, vale o padrão (barra oculta, modo fantasma).
const KEY = prefixed('barra-anotacoes');
const listeners = new Set<() => void>();
let visible = read();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === 'visivel';
  } catch {
    return false;
  }
}

export function setNotesBar(next: boolean): void {
  visible = next;
  try {
    localStorage.setItem(KEY, next ? 'visivel' : 'oculta');
  } catch {
    // Só não lembra na próxima abertura.
  }
  listeners.forEach((listener) => listener());
}

export const notesBarVisible = (): boolean => visible;

export function useNotesBar(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => visible,
  );
}
