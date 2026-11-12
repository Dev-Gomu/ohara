import type { Direction } from '../keyboard/actions';
import type { Rect } from '../keyboard/neighbor';

export interface Leaf {
  kind: 'leaf';
  id: string;
}

export interface Split {
  kind: 'split';
  axis: 'row' | 'col';
  ratio: number;
  first: Tree;
  second: Tree;
}

export type Tree = Leaf | Split;

export interface Size {
  w: number;
  h: number;
}

export const leaf = (id: string): Leaf => ({ kind: 'leaf', id });

export const split = (axis: 'row' | 'col', first: Tree, second: Tree, ratio = 0.5): Split => ({
  kind: 'split',
  axis,
  ratio,
  first,
  second,
});

export function leaves(tree: Tree): string[] {
  return tree.kind === 'leaf' ? [tree.id] : [...leaves(tree.first), ...leaves(tree.second)];
}

function mapLeaves(tree: Tree, change: (node: Leaf) => Tree): Tree {
  if (tree.kind === 'leaf') return change(tree);
  return {
    ...tree,
    first: mapLeaves(tree.first, change),
    second: mapLeaves(tree.second, change),
  };
}

// Dwindle: o bloco novo divide o bloco alvo pelo lado mais longo.
export function insertLeaf(tree: Tree, id: string, target: string, size: Size): Tree {
  const axis = size.w >= size.h ? 'row' : 'col';
  return mapLeaves(tree, (node) => (node.id === target ? split(axis, node, leaf(id)) : node));
}

export function removeLeaf(tree: Tree, id: string): Tree | null {
  if (tree.kind === 'leaf') return tree.id === id ? null : tree;
  const first = removeLeaf(tree.first, id);
  const second = removeLeaf(tree.second, id);
  if (first === null) return second;
  if (second === null) return first;
  return { ...tree, first, second };
}

export function swapLeaves(tree: Tree, a: string, b: string): Tree {
  return mapLeaves(tree, (node) => {
    if (node.id === a) return leaf(b);
    return node.id === b ? leaf(a) : node;
  });
}

export function replaceLeaf(tree: Tree, id: string, next: string): Tree {
  return mapLeaves(tree, (node) => (node.id === id ? leaf(next) : node));
}

export function resetRatios(tree: Tree, reference: Tree): Tree {
  if (tree.kind === 'leaf' || reference.kind === 'leaf') {
    return tree.kind === 'leaf' ? tree : { ...tree, ratio: 0.5 };
  }
  const sameShape = tree.axis === reference.axis;
  return {
    ...tree,
    ratio: sameShape ? reference.ratio : 0.5,
    first: resetRatios(tree.first, reference.first),
    second: resetRatios(tree.second, reference.second),
  };
}

export function rectsOf(tree: Tree, size: Size): Record<string, Rect> {
  const rects: Record<string, Rect> = {};
  const walk = (node: Tree, rect: Rect) => {
    if (node.kind === 'leaf') {
      rects[node.id] = rect;
      return;
    }
    const { x, y, w, h } = rect;
    if (node.axis === 'row') {
      const left = w * node.ratio;
      walk(node.first, { x, y, w: left, h });
      walk(node.second, { x: x + left, y, w: w - left, h });
    } else {
      const top = h * node.ratio;
      walk(node.first, { x, y, w, h: top });
      walk(node.second, { x, y: y + top, w, h: h - top });
    }
  };
  walk(tree, { x: 0, y: 0, w: size.w, h: size.h });
  return rects;
}

function moveDivider(tree: Tree, id: string, axis: 'row' | 'col', delta: number): Tree | null {
  if (tree.kind === 'leaf') return null;
  const inFirst = leaves(tree.first).includes(id);
  if (!inFirst && !leaves(tree.second).includes(id)) return null;
  const child = inFirst ? tree.first : tree.second;
  const moved = moveDivider(child, id, axis, delta);
  if (moved) return inFirst ? { ...tree, first: moved } : { ...tree, second: moved };
  return tree.axis === axis ? { ...tree, ratio: tree.ratio + delta } : null;
}

// Move a divisa mais próxima do bloco. Abaixo do tamanho mínimo, nada muda.
export function resizeLeaf(
  tree: Tree,
  id: string,
  direction: Direction,
  size: Size,
  minimum: Size,
  step = 0.05,
): Tree {
  const axis = direction === 'left' || direction === 'right' ? 'row' : 'col';
  const delta = direction === 'right' || direction === 'down' ? step : -step;
  const moved = moveDivider(tree, id, axis, delta);
  if (!moved) return tree;
  const fits = Object.values(rectsOf(moved, size)).every(
    (rect) => rect.w >= minimum.w && rect.h >= minimum.h,
  );
  return fits ? moved : tree;
}
