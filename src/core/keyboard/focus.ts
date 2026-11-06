import type { KeyAction, Level } from './actions';
import { neighbor, type Rect } from './neighbor';
import type { Overlay } from './resolve';

export interface FocusState {
  level: Level;
  block: string;
  menuIndex: number;
  windowOpen: boolean;
  optionsOpen: boolean;
}

export interface FocusLayout {
  rects: Readonly<Record<string, Rect>>;
  blocks: readonly string[];
  menuItems: number;
}

export type TouchTarget =
  | { kind: 'field'; block: string }
  | { kind: 'block'; block: string }
  | { kind: 'menu' }
  | { kind: 'outside' };

export type FocusChange = KeyAction | { type: 'touch'; target: TouchTarget };

export function overlayOf(state: FocusState): Overlay {
  if (state.windowOpen) return 'window';
  return state.optionsOpen ? 'menu' : 'none';
}

function enter(state: FocusState): FocusState {
  if (state.level === 'menu') return { ...state, level: 'block' };
  if (state.level === 'block') return { ...state, level: 'field' };
  return state;
}

// D18: janela, depois menu ⋮, depois sobe um nível. No nível menu não há para onde subir.
function escape(state: FocusState): FocusState {
  if (state.windowOpen) return { ...state, windowOpen: false };
  if (state.optionsOpen) return { ...state, optionsOpen: false };
  if (state.level === 'field') return { ...state, level: 'block' };
  if (state.level === 'block') return { ...state, level: 'menu' };
  return state;
}

function moveInMenu(
  state: FocusState,
  direction: 'left' | 'down' | 'up' | 'right',
  layout: FocusLayout,
): FocusState {
  if (direction === 'down') return { ...state, level: 'block' };
  if (direction === 'up' || layout.menuItems === 0) return state;
  const step = direction === 'right' ? 1 : -1;
  const menuIndex = (state.menuIndex + step + layout.menuItems) % layout.menuItems;
  return { ...state, menuIndex };
}

function cycleBlock(state: FocusState, step: 1 | -1, layout: FocusLayout): FocusState {
  const total = layout.blocks.length;
  const index = layout.blocks.indexOf(state.block);
  const block = layout.blocks[(index + step + total) % total];
  return block === undefined ? state : { ...state, block };
}

function touch(state: FocusState, target: TouchTarget): FocusState {
  if (overlayOf(state) !== 'none') return state;
  if (target.kind === 'field') return { ...state, level: 'field', block: target.block };
  if (target.kind === 'block') return { ...state, level: 'block', block: target.block };
  if (target.kind === 'menu') return { ...state, level: 'menu' };
  return state.level === 'field' ? { ...state, level: 'block' } : state;
}

export function reduceFocus(
  state: FocusState,
  change: FocusChange,
  layout: FocusLayout,
): FocusState {
  switch (change.type) {
    case 'enter':
      return enter(state);
    case 'escape':
      return escape(state);
    case 'moveFocus': {
      if (state.level === 'menu') return moveInMenu(state, change.direction, layout);
      const block = neighbor(layout.rects, state.block, change.direction);
      return block === null ? state : { ...state, block };
    }
    case 'nextBlock':
      return cycleBlock(state, 1, layout);
    case 'previousBlock':
      return cycleBlock(state, -1, layout);
    case 'openHelp':
      return { ...state, windowOpen: true };
    case 'openOptions':
      return { ...state, optionsOpen: true };
    case 'touch':
      return touch(state, change.target);
    default:
      return state;
  }
}
