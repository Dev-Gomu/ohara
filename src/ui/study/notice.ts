import { useSyncExternalStore } from 'react';

let current: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(text: string | null): void {
  current = text;
  clearTimeout(timer);
  if (text) timer = setTimeout(() => set(null), 8000);
  listeners.forEach((listener) => listener());
}

// Aviso curto sem ação (ex.: arquivo grande demais).
export function showNotice(text: string): void {
  set(text);
}

export function useNotice(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}
