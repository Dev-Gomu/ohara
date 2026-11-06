import { useSyncExternalStore } from 'react';
import { reduceFocus, type FocusChange, type FocusLayout } from '../../core/keyboard/focus';
import type { FocusState } from '../../core/keyboard/focus';
import type { Rect } from '../../core/keyboard/neighbor';
import { KEYS } from '../../core/keyboard/keys';

export interface KeyboardState {
  focus: FocusState;
  lastAction: string | null;
}

// Fora do React: o listener precisa do estado atual mesmo com teclas em sequência rápida.
let state: KeyboardState = {
  focus: { level: 'block', block: 'slides', menuIndex: 0, windowOpen: false, optionsOpen: false },
  lastAction: null,
};

const subscribers = new Set<() => void>();

function subscribe(subscriber: () => void): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function getKeyboardState(): KeyboardState {
  return state;
}

export function useKeyboardState(): KeyboardState {
  return useSyncExternalStore(subscribe, getKeyboardState);
}

function readLayout(): FocusLayout {
  const rects: Record<string, Rect> = {};
  for (const element of document.querySelectorAll<HTMLElement>('[data-block]')) {
    const { x, y, width, height } = element.getBoundingClientRect();
    rects[element.dataset.block ?? ''] = { x, y, w: width, h: height };
  }
  return {
    rects,
    blocks: Object.keys(rects),
    menuItems: document.querySelectorAll('[data-menu-item]').length,
  };
}

function describeChange(change: FocusChange): string | null {
  const row = KEYS.find((key) => key.action === change);
  return row ? `${row.label} · ${row.text}` : state.lastAction;
}

export function dispatch(change: FocusChange): void {
  const focus = reduceFocus(state.focus, change, readLayout());
  const lastAction = describeChange(change);
  if (focus === state.focus && lastAction === state.lastAction) return;
  state = { focus, lastAction };
  subscribers.forEach((subscriber) => subscriber());
}
