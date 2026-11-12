import { useState } from 'react';
import type { KeyAction } from '../../core/keyboard/actions';
import { neighbor } from '../../core/keyboard/neighbor';
import {
  insertLeaf,
  leaves,
  removeLeaf,
  replaceLeaf,
  resetRatios,
  resizeLeaf,
  swapLeaves,
  type Tree,
} from '../../core/mosaic/tree';
import { blockRects, dispatch, getKeyboardState, type BlockOption } from '../keyboard/store';

const MINIMUM = { w: 300, h: 200 };

export interface MosaicView {
  tree: Tree;
  maximized: string | null;
  resizing: boolean;
}

// O arranjo vive em memória até existir banco: o banco o guardará por aula e por aparelho.
const saved = new Map<string, MosaicView>();

export interface Mosaic extends MosaicView {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  setTree: (tree: Tree) => void;
  actions: Partial<Record<KeyAction['type'], (change: KeyAction) => boolean | void>>;
  options: (block: string) => readonly BlockOption[];
}

function areaSize(tree: Tree) {
  const rects = blockRects();
  const open = leaves(tree).flatMap((id) => rects[id] ?? []);
  return {
    w: Math.max(...open.map((rect) => rect.x + rect.w)) - Math.min(...open.map((rect) => rect.x)),
    h: Math.max(...open.map((rect) => rect.y + rect.h)) - Math.min(...open.map((rect) => rect.y)),
  };
}

export function useMosaic(key: string, initial: Tree, all: readonly string[]): Mosaic {
  const [view, setView] = useState<MosaicView>(
    () => saved.get(key) ?? { tree: initial, maximized: null, resizing: false },
  );
  const { tree, maximized, resizing } = view;

  function update(next: Partial<MosaicView>) {
    const merged = { ...view, ...next };
    saved.set(key, merged);
    setView(merged);
  }

  const focused = () => getKeyboardState().focus.block;
  const isOpen = (id: string) => leaves(tree).includes(id);

  function open(id: string) {
    const target = focused();
    const rect = blockRects()[isOpen(target) ? target : (leaves(tree)[0] ?? '')];
    const anchor = isOpen(target) ? target : (leaves(tree)[0] ?? '');
    update({
      tree: insertLeaf(tree, id, anchor, { w: rect?.w ?? 1, h: rect?.h ?? 0 }),
      maximized: null,
    });
    dispatch({ type: 'jump', block: id, level: 'block' });
  }

  // Sempre fica um bloco aberto: mosaico vazio deixaria o foco sem lugar.
  function close(id: string) {
    const next = removeLeaf(tree, id);
    if (next === null) return;
    update({ tree: next, maximized: null });
    if (focused() === id) {
      dispatch({ type: 'jump', block: leaves(next)[0] ?? '', level: 'block' });
    }
  }

  function toggle(id: string) {
    if (isOpen(id)) close(id);
    else open(id);
  }

  function swapWith(direction: 'left' | 'down' | 'up' | 'right') {
    const other = neighbor(blockRects(), focused(), direction);
    if (other !== null) update({ tree: swapLeaves(tree, focused(), other) });
  }

  function swapHidden() {
    const hidden = all.find((id) => !isOpen(id));
    if (hidden === undefined) return;
    const current = focused();
    update({ tree: replaceLeaf(tree, current, hidden) });
    dispatch({ type: 'jump', block: hidden, level: 'block' });
  }

  function startResize() {
    update({ resizing: true, maximized: null });
    dispatch({ type: 'jump', block: focused(), level: 'block' });
  }

  const toggleMaximize = () => update({ maximized: maximized === null ? focused() : null });

  const actions: Mosaic['actions'] = {
    toggleBlock: (change) => {
      if (change.type !== 'toggleBlock') return false;
      const id = all.find((block) => block.endsWith(`.${change.block}`));
      if (id !== undefined) toggle(id);
    },
    closeBlock: () => close(focused()),
    maximizeBlock: toggleMaximize,
    swapBlock: (change) => {
      if (change.type === 'swapBlock') swapWith(change.direction);
    },
    swapHiddenBlock: swapHidden,
    resizeMode: startResize,
    defaultSizes: () => update({ tree: resetRatios(tree, initial) }),
    defaultOrder: () => update({ tree: initial, maximized: null }),
  };

  if (resizing) {
    const stop = () => update({ resizing: false });
    actions.escape = stop;
    actions.enter = stop;
    actions.moveFocus = (change) => {
      if (change.type !== 'moveFocus') return false;
      const next = resizeLeaf(tree, focused(), change.direction, areaSize(tree), MINIMUM);
      update({ tree: next });
    };
  }

  const options = (block: string): readonly BlockOption[] => [
    {
      id: 'ampliar',
      label: maximized === null ? 'Ampliar' : 'Voltar ao mosaico',
      keys: 'Alt M',
      run: toggleMaximize,
    },
    { id: 'tamanho', label: 'Redimensionar', keys: 'Alt R', run: startResize },
    ...(all.some((id) => !isOpen(id))
      ? [{ id: 'trocar', label: 'Trocar pelo escondido', keys: 'Alt X', run: swapHidden }]
      : []),
    ...(leaves(tree).length > 1
      ? [{ id: 'fechar', label: 'Fechar bloco', keys: 'Alt W', run: () => close(block) }]
      : []),
  ];

  return { ...view, isOpen, toggle, setTree: (next) => update({ tree: next }), actions, options };
}
