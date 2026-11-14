import { useSyncExternalStore } from 'react';
import { storage } from './study';

// Jeito de mostrar o cartão (D138): vale por aparelho, não vai para o banco do estudo.
const COMPACT = 'cartao.compacto';
const COLOR = 'cartao.corTitulos';

const listeners = new Set<() => void>();
const read = (key: string, fallback: boolean): boolean => {
  const value = storage.getDeviceState(key);
  return value === undefined ? fallback : value === '1';
};

export interface CardView {
  compact: boolean;
  colorTitles: boolean;
}

let snapshot: CardView | null = null;
const current = (): CardView => {
  snapshot ??= { compact: read(COMPACT, false), colorTitles: read(COLOR, true) };
  return snapshot;
};

function change(key: string, value: boolean): void {
  storage.setDeviceState(key, value ? '1' : '0');
  snapshot = null;
  listeners.forEach((listener) => listener());
}

export const toggleCompact = (): void => change(COMPACT, !current().compact);
export const toggleColorTitles = (): void => change(COLOR, !current().colorTitles);
export const setCompact = (on: boolean): void => change(COMPACT, on);
export const setColorTitles = (on: boolean): void => change(COLOR, on);
export const currentCardView = (): CardView => current();

export function useCardView(): CardView {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    current,
  );
}
