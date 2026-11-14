import { useSyncExternalStore } from 'react';
import type { TrashSpot } from '../../core/keyboard/keys';
import type { TrashKind } from '../../core/study/trashList';

// Estado de tela da janela da Lixeira (fica em memória): tipo da régua, busca, item escolhido,
// menu ⋮ e confirmação do Apagar de vez.
export interface TrashUi {
  kind: TrashKind | 'tudo';
  search: string;
  cursor: number;
  menu: boolean;
  confirm: boolean;
}

const START: TrashUi = { kind: 'tudo', search: '', cursor: 0, menu: false, confirm: false };
let ui: TrashUi = START;
const listeners = new Set<() => void>();

export function setTrashUi(change: Partial<TrashUi>): void {
  ui = { ...ui, ...change };
  listeners.forEach((listener) => listener());
}

export const getTrashUi = (): TrashUi => ui;

export const resetTrashUi = (): void => setTrashUi(START);

export function useTrashUi(): TrashUi {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => ui,
  );
}

// O listener pergunta onde está o foco dentro da janela na hora da tecla.
export function trashSpot(): TrashSpot {
  if (ui.confirm) return 'confirm';
  if (ui.menu) return 'menu';
  return document.activeElement?.matches('[data-trash-search]') ? 'search' : 'list';
}
