import { describe, expect, it } from 'vitest';
import { overlayOf, reduceFocus, type FocusLayout, type FocusState } from './focus';

// a à esquerda, ocupando a altura; b em cima e c embaixo, à direita.
const layout: FocusLayout = {
  rects: {
    a: { x: 0, y: 0, w: 200, h: 200 },
    b: { x: 200, y: 0, w: 200, h: 100 },
    c: { x: 200, y: 100, w: 200, h: 100 },
  },
  blocks: ['a', 'b', 'c'],
  menuItems: 3,
};

const state = (extra: Partial<FocusState> = {}): FocusState => ({
  level: 'block',
  block: 'a',
  menuIndex: 0,
  windowOpen: false,
  optionsOpen: false,
  ...extra,
});

const move = (direction: 'left' | 'down' | 'up' | 'right') =>
  ({ type: 'moveFocus', direction }) as const;

describe('Enter', () => {
  it('desce um nível de cada vez', () => {
    const block = reduceFocus(state({ level: 'menu' }), { type: 'enter' }, layout);
    expect(block.level).toBe('block');
    expect(reduceFocus(block, { type: 'enter' }, layout).level).toBe('field');
  });
});

describe('Esc (D18)', () => {
  it('fecha a janela antes de tudo', () => {
    const before = state({ level: 'field', windowOpen: true, optionsOpen: true });
    const after = reduceFocus(before, { type: 'escape' }, layout);
    expect(after).toEqual({ ...before, windowOpen: false });
  });

  it('depois fecha o menu ⋮', () => {
    const before = state({ level: 'field', optionsOpen: true });
    expect(reduceFocus(before, { type: 'escape' }, layout)).toEqual({
      ...before,
      optionsOpen: false,
    });
  });

  it('depois sobe um nível', () => {
    const block = reduceFocus(state({ level: 'field' }), { type: 'escape' }, layout);
    expect(block.level).toBe('block');
    expect(reduceFocus(block, { type: 'escape' }, layout).level).toBe('menu');
  });

  it('no nível menu não faz nada', () => {
    const before = state({ level: 'menu' });
    expect(reduceFocus(before, { type: 'escape' }, layout)).toBe(before);
  });
});

describe('movimento no nível menu', () => {
  it('Alt J desce para o bloco', () => {
    expect(reduceFocus(state({ level: 'menu' }), move('down'), layout).level).toBe('block');
  });

  it('Alt H e Alt L andam em círculo', () => {
    const first = state({ level: 'menu' });
    const last = reduceFocus(first, move('left'), layout);
    expect(last.menuIndex).toBe(2);
    expect(reduceFocus(last, move('right'), layout).menuIndex).toBe(0);
  });

  it('Alt K não faz nada', () => {
    const before = state({ level: 'menu' });
    expect(reduceFocus(before, move('up'), layout)).toBe(before);
  });
});

describe('movimento entre blocos', () => {
  it('vai ao vizinho', () => {
    expect(reduceFocus(state(), move('right'), layout).block).toBe('b');
    expect(reduceFocus(state({ block: 'b' }), move('down'), layout).block).toBe('c');
  });

  it('no nível campo, troca de bloco e continua no campo', () => {
    const after = reduceFocus(state({ level: 'field' }), move('right'), layout);
    expect(after).toEqual(state({ level: 'field', block: 'b' }));
  });

  it('sem vizinho, nada acontece', () => {
    const before = state();
    expect(reduceFocus(before, move('left'), layout)).toBe(before);
  });
});

describe('Tab', () => {
  it('anda pelos blocos em círculo', () => {
    expect(reduceFocus(state({ block: 'c' }), { type: 'nextBlock' }, layout).block).toBe('a');
    expect(reduceFocus(state(), { type: 'previousBlock' }, layout).block).toBe('c');
  });

  it('sem blocos, nada acontece', () => {
    const before = state();
    const empty = { ...layout, blocks: [] };
    expect(reduceFocus(before, { type: 'nextBlock' }, empty)).toBe(before);
  });
});

describe('janelas', () => {
  it('a ajuda abre como janela', () => {
    const after = reduceFocus(state(), { type: 'openHelp' }, layout);
    expect(overlayOf(after)).toBe('window');
  });

  it('as opções abrem como menu', () => {
    const after = reduceFocus(state(), { type: 'openOptions' }, layout);
    expect(overlayOf(after)).toBe('menu');
  });

  it('sem nada aberto', () => {
    expect(overlayOf(state())).toBe('none');
  });
});

describe('toque', () => {
  it('no campo, põe o nível em campo e troca o bloco', () => {
    const target = { kind: 'field', block: 'b' } as const;
    const after = reduceFocus(state({ level: 'menu' }), { type: 'touch', target }, layout);
    expect(after).toEqual(state({ level: 'field', block: 'b' }));
  });

  it('no bloco, põe o nível em bloco', () => {
    const target = { kind: 'block', block: 'c' } as const;
    const after = reduceFocus(state({ level: 'field' }), { type: 'touch', target }, layout);
    expect(after).toEqual(state({ level: 'block', block: 'c' }));
  });

  it('no menu, põe o nível em menu', () => {
    const target = { kind: 'menu' } as const;
    expect(reduceFocus(state(), { type: 'touch', target }, layout).level).toBe('menu');
  });

  it('fora de tudo, sai do campo, que perdeu o cursor', () => {
    const target = { kind: 'outside' } as const;
    const field = state({ level: 'field' });
    expect(reduceFocus(field, { type: 'touch', target }, layout).level).toBe('block');
    const menu = state({ level: 'menu' });
    expect(reduceFocus(menu, { type: 'touch', target }, layout)).toBe(menu);
  });

  it('com janela ou menu ⋮ aberto, não muda nada', () => {
    const target = { kind: 'field', block: 'b' } as const;
    const window = state({ windowOpen: true });
    expect(reduceFocus(window, { type: 'touch', target }, layout)).toBe(window);
    const options = state({ optionsOpen: true });
    expect(reduceFocus(options, { type: 'touch', target }, layout)).toBe(options);
  });
});

describe('ações que ainda não mexem no foco', () => {
  it('devolvem o mesmo estado', () => {
    const before = state();
    expect(reduceFocus(before, { type: 'bold' }, layout)).toBe(before);
    expect(reduceFocus(before, { type: 'goToScreen', screen: 'hub' }, layout)).toBe(before);
  });
});
