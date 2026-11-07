import type { Direction, KeyAction, Level } from './actions';
import { stepNav, type NavShape } from './nav';
import { neighbor, type Rect } from './neighbor';
import type { Overlay } from './resolve';

export type WindowId = 'help' | 'palette' | 'reminder' | (string & {});

export interface FocusState {
  level: Level;
  block: string;
  menuIndex: number;
  window: WindowId | null;
  optionsOpen: boolean;
  // Item escolhido em cada campo navegável. Sobrevive à saída do bloco: a seleção permanece.
  items: Readonly<Record<string, number>>;
}

export interface BlockSpec {
  kind: 'text' | 'nav' | 'none';
  nav?: NavShape;
  // Mosaico fixo declara os vizinhos: a geometria erra com blocos de larguras diferentes (D73).
  neighbors?: Partial<Record<Direction, string>>;
  // Blocos cujo item volta ao primeiro quando este muda: o filtro zera a lista filtrada.
  resets?: readonly string[];
  // Na régua de filtro, Enter segue para o conteúdo filtrado.
  enterGoesTo?: string;
}

export interface FocusLayout {
  rects: Readonly<Record<string, Rect>>;
  blocks: readonly string[];
  menuItems: number;
  specs?: Readonly<Record<string, BlockSpec>>;
  hasParent?: boolean;
}

export type TouchTarget =
  | { kind: 'field'; block: string }
  | { kind: 'item'; block: string; index: number }
  | { kind: 'block'; block: string }
  | { kind: 'menu' }
  | { kind: 'outside' };

export type FocusChange =
  | KeyAction
  | { type: 'touch'; target: TouchTarget }
  | { type: 'jump'; block: string; level: Level };

export function overlayOf(state: FocusState): Overlay {
  if (state.window !== null) return 'window';
  return state.optionsOpen ? 'menu' : 'none';
}

function specOf(layout: FocusLayout, block: string): BlockSpec {
  return layout.specs?.[block] ?? { kind: 'text' };
}

function innerLevel(block: string, layout: FocusLayout): Level {
  const { kind } = specOf(layout, block);
  if (kind === 'none') return 'block';
  return kind === 'nav' ? 'nav' : 'field';
}

function enter(state: FocusState, layout: FocusLayout): FocusState {
  if (state.level === 'menu') return { ...state, level: 'block' };
  if (state.level === 'block') return { ...state, level: innerLevel(state.block, layout) };
  const target = specOf(layout, state.block).enterGoesTo;
  if (state.level !== 'nav' || target === undefined) return state;
  const count = specOf(layout, target).nav?.count ?? 0;
  if (count === 0) return state;
  return {
    ...state,
    block: target,
    level: innerLevel(target, layout),
    items: { ...state.items, [target]: 0 },
  };
}

// D72: da subtela, Esc no nível bloco volta à tela-mãe antes de subir à barra de telas.
export function escapeGoesBack(state: FocusState, layout: FocusLayout): boolean {
  return overlayOf(state) === 'none' && state.level === 'block' && layout.hasParent === true;
}

// D18: janela, depois menu ⋮, depois sobe um nível. No nível menu não há para onde subir.
function escape(state: FocusState): FocusState {
  if (state.window !== null) return { ...state, window: null };
  if (state.optionsOpen) return { ...state, optionsOpen: false };
  if (state.level === 'field' || state.level === 'nav') return { ...state, level: 'block' };
  if (state.level === 'block') return { ...state, level: 'menu' };
  return state;
}

function moveInMenu(state: FocusState, direction: Direction, layout: FocusLayout): FocusState {
  if (direction === 'down') return { ...state, level: 'block' };
  if (direction === 'up' || layout.menuItems === 0) return state;
  const step = direction === 'right' ? 1 : -1;
  const menuIndex = (state.menuIndex + step + layout.menuItems) % layout.menuItems;
  return { ...state, menuIndex };
}

function neighborOf(state: FocusState, direction: Direction, layout: FocusLayout): string | null {
  const declared = specOf(layout, state.block).neighbors;
  if (declared) return declared[direction] ?? null;
  return neighbor(layout.rects, state.block, direction);
}

// Sair para o vizinho mantém a profundidade: de dentro de um campo, chega dentro do outro.
function moveToNeighbor(state: FocusState, direction: Direction, layout: FocusLayout): FocusState {
  const block = neighborOf(state, direction, layout);
  if (block === null) return state;
  const level = state.level === 'block' ? 'block' : innerLevel(block, layout);
  return { ...state, block, level };
}

function selectItem(
  state: FocusState,
  block: string,
  index: number,
  layout: FocusLayout,
): FocusState {
  if ((state.items[block] ?? 0) === index) return state;
  const items = { ...state.items, [block]: index };
  for (const reset of specOf(layout, block).resets ?? []) items[reset] = 0;
  return { ...state, items };
}

function stepInField(
  state: FocusState,
  direction: Direction,
  layout: FocusLayout,
  repeat: boolean,
): FocusState {
  const shape = specOf(layout, state.block).nav;
  if (!shape) return state;
  const next = stepNav(shape, state.items[state.block] ?? 0, direction);
  if (next !== 'exit') return selectItem(state, state.block, next, layout);
  // D71: segurar a tecla para na borda. Sair exige apertar de novo.
  return repeat ? state : moveToNeighbor(state, direction, layout);
}

function cycleBlock(state: FocusState, step: 1 | -1, layout: FocusLayout): FocusState {
  const total = layout.blocks.length;
  const index = layout.blocks.indexOf(state.block);
  const block = layout.blocks[(index + step + total) % total];
  if (block === undefined) return state;
  return { ...state, block, level: state.level === 'menu' ? 'menu' : 'block' };
}

function touch(state: FocusState, target: TouchTarget, layout: FocusLayout): FocusState {
  if (overlayOf(state) !== 'none') return state;
  if (target.kind === 'field') return { ...state, level: 'field', block: target.block };
  if (target.kind === 'block') return { ...state, level: 'block', block: target.block };
  if (target.kind === 'menu') return { ...state, level: 'menu' };
  if (target.kind === 'item') {
    const next = selectItem(state, target.block, target.index, layout);
    return { ...next, level: 'nav', block: target.block };
  }
  return state.level === 'field' ? { ...state, level: 'block' } : state;
}

export function reduceFocus(
  state: FocusState,
  change: FocusChange,
  layout: FocusLayout,
  repeat = false,
): FocusState {
  switch (change.type) {
    case 'enter':
      return enter(state, layout);
    case 'escape':
      return escape(state);
    case 'moveFocus':
      if (state.level === 'menu') return moveInMenu(state, change.direction, layout);
      if (state.level === 'nav' && change.step) {
        return stepInField(state, change.direction, layout, repeat);
      }
      return moveToNeighbor(state, change.direction, layout);
    case 'nextBlock':
      return cycleBlock(state, 1, layout);
    case 'previousBlock':
      return cycleBlock(state, -1, layout);
    case 'openHelp':
      return { ...state, window: 'help' };
    case 'openPalette':
      return { ...state, window: 'palette' };
    case 'quickReminder':
      return { ...state, window: 'reminder' };
    case 'openOptions':
      return { ...state, optionsOpen: true };
    case 'goToField':
      return state.level === 'block' ? { ...state, level: innerLevel(state.block, layout) } : state;
    case 'touch':
      return touch(state, change.target, layout);
    case 'jump':
      return { ...state, block: change.block, level: change.level };
    default:
      return state;
  }
}
