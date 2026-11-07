import { describe, expect, it } from 'vitest';
import {
  insertLeaf,
  leaf,
  leaves,
  rectsOf,
  removeLeaf,
  replaceLeaf,
  resetRatios,
  resizeLeaf,
  split,
  swapLeaves,
} from './tree';

const size = { w: 1000, h: 600 };
const minimum = { w: 300, h: 200 };
// a e c à esquerda, um sobre o outro; b à direita
const tree = split('row', split('col', leaf('a'), leaf('c')), leaf('b'));

describe('dwindle', () => {
  it('divide pelo lado mais longo', () => {
    expect(insertLeaf(leaf('a'), 'b', 'a', { w: 900, h: 500 })).toMatchObject({ axis: 'row' });
    expect(insertLeaf(leaf('a'), 'b', 'a', { w: 400, h: 500 })).toMatchObject({ axis: 'col' });
  });

  it('o bloco novo entra depois do alvo', () => {
    const next = insertLeaf(tree, 'd', 'b', { w: 500, h: 600 });
    expect(leaves(next)).toEqual(['a', 'c', 'b', 'd']);
  });
});

describe('remover', () => {
  it('o irmão ocupa o lugar', () => {
    expect(removeLeaf(tree, 'c')).toEqual(split('row', leaf('a'), leaf('b')));
  });

  it('o último bloco deixa a árvore vazia', () => {
    expect(removeLeaf(leaf('a'), 'a')).toBeNull();
  });
});

describe('trocar', () => {
  it('troca dois blocos de lugar', () => {
    expect(leaves(swapLeaves(tree, 'a', 'b'))).toEqual(['b', 'c', 'a']);
  });

  it('troca pelo bloco escondido', () => {
    expect(leaves(replaceLeaf(tree, 'b', 'z'))).toEqual(['a', 'c', 'z']);
  });
});

describe('retângulos', () => {
  it('cobrem a área inteira', () => {
    const rects = rectsOf(tree, size);
    expect(rects.b).toEqual({ x: 500, y: 0, w: 500, h: 600 });
    expect(rects.c).toEqual({ x: 0, y: 300, w: 500, h: 300 });
  });
});

describe('redimensionar', () => {
  it('move a divisa mais próxima no eixo pedido', () => {
    const next = resizeLeaf(tree, 'a', 'down', size, minimum);
    expect(rectsOf(next, size).a?.h).toBeCloseTo(330);
    expect(rectsOf(next, size).b?.w).toBe(500);
  });

  it('sobe até a divisa de fora quando o eixo não existe por perto', () => {
    const next = resizeLeaf(tree, 'a', 'right', size, minimum);
    expect(rectsOf(next, size).a?.w).toBeCloseTo(550);
  });

  it('não passa do tamanho mínimo', () => {
    const tight = split('row', leaf('a'), leaf('b'), 0.31);
    expect(resizeLeaf(tight, 'a', 'left', size, minimum)).toBe(tight);
  });

  it('sem divisa no eixo, nada muda', () => {
    const one = split('row', leaf('a'), leaf('b'));
    expect(resizeLeaf(one, 'a', 'down', size, minimum)).toBe(one);
  });
});

describe('tamanhos padrão', () => {
  it('volta às proporções de referência', () => {
    const changed = split('row', leaf('a'), leaf('b'), 0.7);
    const reference = split('row', leaf('x'), leaf('y'), 0.6);
    expect(resetRatios(changed, reference)).toEqual(split('row', leaf('a'), leaf('b'), 0.6));
  });
});
