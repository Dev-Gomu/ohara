import { useSyncExternalStore } from 'react';
import { SCREENS, type KeyAction, type Level, type Screen } from '../../core/keyboard/actions';
import {
  escapeGoesBack,
  overlayOf,
  reduceFocus,
  type BlockSpec,
  type FocusChange,
  type FocusLayout,
  type FocusState,
} from '../../core/keyboard/focus';
import { KEYS } from '../../core/keyboard/keys';
import type { Rect } from '../../core/keyboard/neighbor';

export interface UiBlock extends BlockSpec {
  id: string;
  onActivate?: (index: number) => void;
}

export interface FocusPlace {
  block: string;
  level: Level;
  items?: Readonly<Record<string, number>>;
}

export interface ScreenRegistration {
  blocks: readonly UiBlock[];
  arrival: FocusPlace;
  back?: () => void;
  // Devolver false deixa a tecla seguir o caminho normal.
  actions?: Partial<Record<KeyAction['type'], (change: KeyAction) => boolean | void>>;
  options?: (block: string) => readonly BlockOption[];
}

export interface BlockOption {
  id: string;
  label: string;
  keys?: string;
  run: () => void;
}

export interface KeyboardState {
  focus: FocusState;
  screen: Screen;
  lastAction: string | null;
}

// Fora do React: o listener precisa do estado atual mesmo com teclas em sequência rápida.
let state: KeyboardState = {
  focus: { level: 'block', block: '', menuIndex: 0, window: null, optionsOpen: false, items: {} },
  screen: 'hub',
  lastAction: null,
};

let registration: ScreenRegistration = { blocks: [], arrival: { block: '', level: 'block' } };
const memory: Partial<Record<Screen, FocusPlace>> = {};
const subscribers = new Set<() => void>();

function subscribe(subscriber: () => void): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

function publish(next: KeyboardState): void {
  state = next;
  subscribers.forEach((subscriber) => subscriber());
}

export function getKeyboardState(): KeyboardState {
  return state;
}

export function useKeyboardState(): KeyboardState {
  return useSyncExternalStore(subscribe, getKeyboardState);
}

export function registerScreen(next: ScreenRegistration): void {
  registration = next;
}

function readLayout(): FocusLayout {
  const rects: Record<string, Rect> = {};
  for (const element of document.querySelectorAll<HTMLElement>('[data-block]')) {
    const { x, y, width, height } = element.getBoundingClientRect();
    if (width > 0) rects[element.dataset.block ?? ''] = { x, y, w: width, h: height };
  }
  return {
    rects,
    blocks: registration.blocks.map((block) => block.id).filter((id) => id in rects),
    menuItems: document.querySelectorAll('[data-menu-item]').length,
    specs: Object.fromEntries(registration.blocks.map((block) => [block.id, block])),
    hasParent: registration.back !== undefined,
  };
}

export function blockRects(): Readonly<Record<string, Rect>> {
  return readLayout().rects;
}

export function blockOptions(block: string): readonly BlockOption[] {
  return registration.options?.(block) ?? [];
}

function describeChange(change: FocusChange): string | null {
  const row = KEYS.find((key) => key.action === change);
  return row ? `${row.label} · ${row.text}` : state.lastAction;
}

function goToScreen(screen: Screen): void {
  const { focus } = state;
  if (screen === state.screen) {
    if (focus.level === 'menu') publish({ ...state, focus: { ...focus, level: 'block' } });
    return;
  }
  if (focus.level !== 'menu') memory[state.screen] = { block: focus.block, level: focus.level };
  // Sem memória, o bloco vazio faz a tela nova aplicar o foco de chegada.
  const place = memory[screen] ?? { block: '', level: 'block' };
  publish({ ...state, screen, focus: { ...focus, ...place, optionsOpen: false } });
}

function runMenuItem(): void {
  const screen = SCREENS[state.focus.menuIndex];
  if (screen) goToScreen(screen);
  else dispatch({ type: 'openHelp' });
}

// Tudo que depende da tela atual. Devolve verdadeiro se a tecla já foi tratada.
function runScreenAction(change: FocusChange, layout: FocusLayout): boolean {
  const { focus } = state;
  if (change.type === 'goToScreen') {
    goToScreen(change.screen);
    return true;
  }
  if (change.type !== 'touch' && change.type !== 'jump' && change.type !== 'openWindow') {
    const handler = registration.actions?.[change.type];
    if (handler && handler(change) !== false) return true;
  }
  if (change.type === 'escape' && escapeGoesBack(focus, layout)) {
    registration.back?.();
    return true;
  }
  if (change.type === 'enter' && focus.level === 'menu') {
    runMenuItem();
    return true;
  }
  if (change.type === 'enter' && focus.level === 'nav') {
    const block = registration.blocks.find((item) => item.id === focus.block);
    block?.onActivate?.(focus.items[focus.block] ?? 0);
    return block?.enterGoesTo === undefined;
  }
  return false;
}

export function dispatch(change: FocusChange, repeat = false): void {
  document.documentElement.dataset.entrada = change.type === 'touch' ? 'toque' : 'teclado';
  const layout = readLayout();
  const lastAction = describeChange(change);
  if (overlayOf(state.focus) === 'none' && runScreenAction(change, layout)) {
    if (lastAction !== state.lastAction) publish({ ...state, lastAction });
    return;
  }
  const reduced = reduceFocus(state.focus, change, layout, repeat);
  const focus =
    reduced.level === 'menu' && state.focus.level !== 'menu'
      ? { ...reduced, menuIndex: SCREENS.indexOf(state.screen) }
      : reduced;
  if (focus === state.focus && lastAction === state.lastAction) return;
  publish({ ...state, focus, lastAction });
}
