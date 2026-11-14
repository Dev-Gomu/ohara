import { describe, expect, it } from 'vitest';
import { backspaceAtStart, groupLines, locate, markLength, offsetOf, splitAt } from './cardLines';

describe('markLength', () => {
  it('mede a marca no começo', () => {
    expect(markLength('@ Quem?')).toBe(2);
    expect(markLength('## Fase')).toBe(3);
    expect(markLength('12. texto')).toBe(4);
    expect(markLength('sem marca')).toBe(0);
    expect(markLength('-5 mmHg')).toBe(0);
  });
});

describe('splitAt (Enter)', () => {
  it('lista continua a marca', () => {
    expect(splitAt('- Febre', 0, 7, 7)).toEqual({ source: '- Febre\n- ', line: 1, caret: 2 });
  });
  it('lista numerada soma 1', () => {
    expect(splitAt('1. a\nfim', 0, 4, 4)).toEqual({ source: '1. a\n2. \nfim', line: 1, caret: 3 });
  });
  it('título e frente abrem linha sem marca', () => {
    expect(splitAt('# Efeitos', 0, 9, 9)).toEqual({ source: '# Efeitos\n', line: 1, caret: 0 });
    expect(splitAt('@ Quem?', 0, 7, 7)).toEqual({ source: '@ Quem?\n', line: 1, caret: 0 });
  });
  it('parte a linha no meio do texto', () => {
    expect(splitAt('- Febre alta', 0, 7, 7)).toEqual({ source: '- Febre\n-  alta', line: 1, caret: 2 });
  });
  it('lista vazia perde a marca em vez de abrir outra linha', () => {
    expect(splitAt('- a\n- ', 1, 2, 2)).toEqual({ source: '- a\n', line: 1, caret: 0 });
  });
  it('apaga a seleção ao dividir', () => {
    expect(splitAt('abcdef', 0, 2, 4)).toEqual({ source: 'ab\nef', line: 1, caret: 0 });
  });
});

describe('backspaceAtStart', () => {
  it('tira a marca primeiro', () => {
    expect(backspaceAtStart('# Efeitos', 0)).toEqual({ source: 'Efeitos', line: 0, caret: 0 });
  });
  it('sem marca, junta com a linha de cima', () => {
    expect(backspaceAtStart('abc\ndef', 1)).toEqual({ source: 'abcdef', line: 0, caret: 3 });
  });
  it('na primeira linha sem marca não faz nada', () => {
    expect(backspaceAtStart('abc', 0)).toBeNull();
  });
});

describe('posições e cartões', () => {
  it('locate e offsetOf são inversos', () => {
    const text = 'ab\ncde\nf';
    expect(locate(text, 4)).toEqual({ line: 1, caret: 1 });
    expect(offsetOf(text, 1, 1)).toBe(4);
  });
  it('agrupa por "@" e junta o texto solto do começo', () => {
    expect(groupLines('solto\n@ A\nx\n\n@ B')).toEqual([
      { first: 0, lines: [0] },
      { first: 1, lines: [1, 2, 3] },
      { first: 4, lines: [4] },
    ]);
  });
});
