import { useSyncExternalStore } from 'react';

// Modo Ajustar da tabela (D149). Fora do React: o listener precisa saber na hora da tecla.
let adjusting = false;
const subscribers = new Set<() => void>();

export const isAdjusting = (): boolean => adjusting;

export function setAdjusting(on: boolean): void {
  if (adjusting === on) return;
  adjusting = on;
  subscribers.forEach((subscriber) => subscriber());
}

export function subscribeAdjusting(subscriber: () => void): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function useAdjusting(): boolean {
  return useSyncExternalStore(subscribeAdjusting, isAdjusting);
}
