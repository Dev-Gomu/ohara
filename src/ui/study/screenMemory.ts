import { useSyncExternalStore } from 'react';

const memory = new Map<string, unknown>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setScreenMemory<T>(key: string, value: T): void {
  memory.set(key, value);
  listeners.forEach((listener) => listener());
}

// Estado de tela que sobrevive à troca de tela, só enquanto o app está aberto (D26).
export function useScreenMemory<T>(key: string, initial: T): [T, (value: T) => void] {
  const value = useSyncExternalStore(subscribe, () => memory.get(key) as T | undefined);
  return [value === undefined ? initial : value, (next) => setScreenMemory(key, next)];
}
