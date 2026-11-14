import { useSyncExternalStore } from 'react';
import { prefixed } from '../../core/appInfo';

// Como a barra do topo mostra as telas: só o número, número com ícone, só o ícone ou o ícone
// com o número pequeno no canto (em cima ou embaixo).
export type TopTabs = 'numeros' | 'ambos' | 'icones' | 'sobrescrito' | 'subscrito';

const MODES: readonly TopTabs[] = ['numeros', 'ambos', 'icones', 'sobrescrito', 'subscrito'];
const KEY = prefixed('abas-topo');
const listeners = new Set<() => void>();
let memory: TopTabs | null = null;

export const TOP_TABS_NAMES: Readonly<Record<TopTabs, string>> = {
  numeros: 'Só números',
  ambos: 'Número e ícone',
  icones: 'Só ícones',
  sobrescrito: 'Número em cima',
  subscrito: 'Número embaixo',
};

// Preferência de aparelho, como o tema: sem armazenamento vale o padrão.
export function currentTopTabs(): TopTabs {
  if (memory) return memory;
  try {
    const value = localStorage.getItem(KEY);
    return MODES.find((mode) => mode === value) ?? 'ambos';
  } catch {
    return 'ambos';
  }
}

const read = currentTopTabs;

export function cycleTopTabs(): TopTabs {
  const next = MODES[(MODES.indexOf(read()) + 1) % MODES.length] ?? 'ambos';
  setTopTabs(next);
  return next;
}

export function setTopTabs(next: TopTabs): void {
  memory = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Vale só até recarregar.
  }
  listeners.forEach((listener) => listener());
}

export function useTopTabs(): TopTabs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => 'ambos',
  );
}
