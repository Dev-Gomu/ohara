import { describe, expect, it } from 'vitest';
import type { Level } from './actions';
import { resolve, type KeyContext, type KeyInput } from './resolve';

const press = (code: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  code,
  key: 'x',
  alt: false,
  ctrl: false,
  shift: false,
  meta: false,
  altGraph: false,
  isComposing: false,
  repeat: false,
  ...extra,
});

const at = (level: Level): KeyContext => ({ level, overlay: 'none' });
const inWindow: KeyContext = { level: 'block', overlay: 'window' };
const inOptions: KeyContext = { level: 'field', overlay: 'menu' };
const swallow = { type: 'swallow' };

describe('no campo, o texto é do usuário', () => {
  it.each([
    'KeyA',
    'KeyH',
    'KeyJ',
    'KeyK',
    'KeyL',
    'ArrowLeft',
    'ArrowDown',
    'ArrowUp',
    'ArrowRight',
    'Enter',
    'Tab',
    'Space',
  ])('%s resolve para nulo', (code) => {
    expect(resolve(press(code), at('field'))).toBeNull();
  });

  it('Shift Tab resolve para nulo', () => {
    expect(resolve(press('Tab', { shift: true }), at('field'))).toBeNull();
  });
});

describe('AltGr nunca é atalho', () => {
  it.each(['Digit1', 'Digit2', 'Digit3', 'KeyQ'])('%s com AltGr', (code) => {
    expect(resolve(press(code, { altGraph: true }), at('field'))).toBeNull();
  });

  it('nem quando chega como Ctrl+Alt', () => {
    const input = press('Digit1', { altGraph: true, ctrl: true, alt: true });
    expect(resolve(input, at('field'))).toBeNull();
  });

  it('Ctrl Alt 1 de verdade continua sendo Título 1', () => {
    const input = press('Digit1', { ctrl: true, alt: true });
    expect(resolve(input, at('field'))).toEqual({ type: 'heading', level: 1 });
  });
});

describe('composição e teclas sem código', () => {
  it.each<[string, KeyInput]>([
    ['isComposing', press('KeyH', { alt: true, isComposing: true })],
    ['tecla morta', press('BracketLeft', { key: 'Dead' })],
    ['sem code', press('', { key: 'Unidentified' })],
  ])('%s resolve para nulo', (_name, input) => {
    expect(resolve(input, at('block'))).toBeNull();
    expect(resolve(input, inWindow)).toBeNull();
  });

  it('Esc durante a composição é do sistema de acentos', () => {
    expect(resolve(press('Escape', { isComposing: true }), inWindow)).toBeNull();
  });
});

describe('Meta', () => {
  it('nunca é atalho', () => {
    expect(resolve(press('KeyH', { alt: true, meta: true }), at('block'))).toBeNull();
  });
});

describe('Ctrl fora do campo', () => {
  it('fica com o navegador', () => {
    expect(resolve(press('KeyB', { ctrl: true }), at('block'))).toBeNull();
    expect(resolve(press('KeyB', { ctrl: true }), at('menu'))).toBeNull();
  });

  it('exceto Ctrl P, que é da Paleta em todos os níveis', () => {
    const paleta = { type: 'openPalette' };
    expect(resolve(press('KeyP', { ctrl: true }), at('menu'))).toEqual(paleta);
    expect(resolve(press('KeyP', { ctrl: true }), at('block'))).toEqual(paleta);
    expect(resolve(press('KeyP', { ctrl: true }), at('field'))).toEqual(paleta);
  });
});

describe('repetição', () => {
  it('movimento e troca de página repetem', () => {
    const move = { type: 'moveFocus', direction: 'left', step: true };
    expect(resolve(press('KeyH', { repeat: true }), at('block'))).toEqual(move);
    const page = { type: 'changePage', step: 1 };
    expect(resolve(press('PageDown', { alt: true, repeat: true }), at('block'))).toEqual(page);
  });

  it('Alt S segurado não abre e fecha sem parar', () => {
    expect(resolve(press('KeyS', { alt: true, repeat: true }), at('block'))).toEqual(swallow);
  });

  it('segurar Alt F e Ctrl P não chega ao navegador', () => {
    expect(resolve(press('KeyF', { alt: true, repeat: true }), at('block'))).toEqual(swallow);
    expect(resolve(press('KeyP', { ctrl: true, repeat: true }), at('block'))).toEqual(swallow);
  });

  it('repetição de tecla do texto continua nula', () => {
    expect(resolve(press('KeyH', { repeat: true }), at('field'))).toBeNull();
  });
});

describe.each([
  ['janela', inWindow],
  ['menu ⋮', inOptions],
])('com %s aberto', (_name, context) => {
  it('só Esc age', () => {
    expect(resolve(press('Escape'), context)).toEqual({ type: 'escape' });
  });

  it('Esc segurado não fecha também o que está atrás', () => {
    expect(resolve(press('Escape', { repeat: true }), context)).toEqual(swallow);
  });

  it.each(['ArrowDown', 'ArrowUp', 'KeyH', 'Enter', 'Tab', 'KeyZ'])(
    '%s solta segue para a janela',
    (code) => {
      expect(resolve(press(code), context)).toBeNull();
    },
  );

  it('teclas com Alt e Ctrl da tabela são engolidas', () => {
    expect(resolve(press('ArrowLeft', { alt: true }), context)).toEqual(swallow);
    expect(resolve(press('Digit1', { alt: true }), context)).toEqual(swallow);
    expect(resolve(press('KeyP', { ctrl: true }), context)).toEqual(swallow);
    expect(resolve(press('KeyB', { ctrl: true }), context)).toEqual(swallow);
  });

  it('F1 é engolida: a ajuda do navegador não abre', () => {
    expect(resolve(press('F1'), context)).toEqual(swallow);
  });

  it('teclas fora da tabela não são tocadas', () => {
    expect(resolve(press('KeyA', { ctrl: true }), context)).toBeNull();
  });
});

describe('modo Ajustar da tabela (D149)', () => {
  const press = (code: string, shift = false): KeyInput => ({
    code, key: 'x', alt: false, ctrl: false, shift, meta: false, altGraph: false, isComposing: false, repeat: false,
  });
  const on = { level: 'field', overlay: 'none', adjusting: true } as const;

  it('setas mudam o tamanho, com Shift o passo é grande', () => {
    expect(resolve(press('ArrowRight'), on)).toEqual({ type: 'tableAdjust', axis: 'width', delta: 8 });
    expect(resolve(press('ArrowUp', true), on)).toEqual({ type: 'tableAdjust', axis: 'height', delta: -24 });
  });

  it('Enter e Esc terminam', () => {
    expect(resolve(press('Escape'), on)).toEqual({ type: 'tableAdjustEnd' });
    expect(resolve(press('Enter'), on)).toEqual({ type: 'tableAdjustEnd' });
  });

  it('fora do modo as setas são do texto', () => {
    expect(resolve(press('ArrowRight'), { level: 'field', overlay: 'none' })).toBeNull();
  });
});

describe('linha do cartão novo', () => {
  const at = (...spots: ('any' | 'start' | 'top' | 'bottom')[]) =>
    ({ level: 'field', overlay: 'none', cardLine: spots }) as const;

  it('Enter é do cartão em qualquer ponto da linha', () => {
    expect(resolve(press('Enter'), at('any'))).toEqual({ type: 'cardLineSplit' });
  });
  it('Backspace só no começo; ↑ na primeira linha visual; ↓ na última', () => {
    expect(resolve(press('Backspace'), at('any'))).toBeNull();
    expect(resolve(press('Backspace'), at('any', 'start'))).toEqual({ type: 'cardLineBack' });
    expect(resolve(press('ArrowUp'), at('any', 'top'))).toEqual({ type: 'cardLineMove', delta: -1 });
    expect(resolve(press('ArrowDown'), at('any', 'top'))).toBeNull();
    expect(resolve(press('ArrowDown'), at('any', 'bottom'))).toEqual({ type: 'cardLineMove', delta: 1 });
  });
  it('fora da linha do cartão, as teclas seguem para o texto', () => {
    expect(resolve(press('Enter'), { level: 'field', overlay: 'none' })).toBeNull();
  });
  it('com modificador a tabela de teclas continua valendo', () => {
    expect(resolve(press('Enter', { ctrl: true }), at('any'))?.type).toBe('saveCards');
  });
});
