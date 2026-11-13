import { describe, expect, it } from 'vitest';
import type { Level } from './actions';
import { KEYS, type KeyRow } from './keys';
import { findConflicts, groupLines, helpLines, helpSections, linesOf } from './keyTools';
import { resolve, type KeyInput } from './resolve';

const LEVELS: readonly Level[] = ['menu', 'block', 'field', 'nav'];

// Transcrito de docs/teclado.md: a tabela não pode perder nem ganhar tecla em silêncio.
const LABELS_IN_DOC = [
  ...['1', '2', '3', '4', '5', '6'].map((n) => `Alt ${n}`),
  ...['H', 'J', 'K', 'L', '←', '↓', '↑', '→'].map((k) => `Alt ${k}`),
  ...['H', 'J', 'K', 'L'].map((k) => `Alt Shift ${k}`),
  ...['H', 'J', 'K', 'L', '←', '↓', '↑', '→'],
  ...['Enter', 'Esc', 'Tab', 'Shift Tab'],
  ...['S', 'A', 'C', 'D', 'M', 'W', 'R', 'X', 'O', 'T', 'F', 'B', ',', '.', 'N', '0'].map(
    (k) => `Alt ${k}`,
  ),
  'Alt Shift 0',
  ...['Alt P', 'Ctrl P', 'Alt I', 'Alt Z', 'Alt /', 'F1'],
  ...['Alt [', 'Alt Page Up', 'Alt ]', 'Alt Page Down'],
  ...['Espaço', '1', '2', '3', '4'],
  ...['B', 'I', 'U', 'K', 'E', 'M'].map((k) => `Ctrl ${k}`),
  ...['Ctrl Shift H', 'Ctrl Shift X'],
  ...['1', '2', '3'].map((n) => `Ctrl Alt ${n}`),
  ...['7', '8', '9'].map((n) => `Ctrl Shift ${n}`),
  'Ctrl Enter',
  'Ctrl .',
  'Ctrl ,',
];

function pressOf(key: KeyRow): KeyInput {
  return {
    code: key.code,
    key: 'x',
    alt: key.mods.includes('a'),
    ctrl: key.mods.includes('c'),
    shift: key.mods.includes('s'),
    meta: false,
    altGraph: false,
    isComposing: false,
    repeat: false,
  };
}

describe('tabela de teclas', () => {
  it('tem as 79 teclas de teclado.md', () => {
    expect(KEYS).toHaveLength(79);
    expect(KEYS.map((key) => key.label).sort()).toEqual([...LABELS_IN_DOC].sort());
  });

  it('não tem Alt ; (D61)', () => {
    expect(KEYS.some((key) => key.label === 'Alt ;' || key.code === 'Slash')).toBe(false);
  });

  it('não tem conflito de code + modificadores + nível', () => {
    expect(findConflicts()).toEqual([]);
  });

  it('acusa uma linha duplicada', () => {
    const first = KEYS[0] as KeyRow;
    expect(findConflicts([first, first])).not.toEqual([]);
  });

  it('dá uma ação própria a cada linha', () => {
    expect(new Set(KEYS.map((key) => key.action)).size).toBe(KEYS.length);
  });
});

describe.each(KEYS.map((key) => [key.label, key] as const))('tecla %s', (_label, key) => {
  it.each(LEVELS)('no nível %s', (level) => {
    const expected = key.levels.includes(level) ? key.action : null;
    expect(resolve(pressOf(key), { level, overlay: 'none' })).toBe(expected);
  });

  it('segurada, só repete se a linha permitir', () => {
    const level = key.levels[0] as Level;
    const held = resolve({ ...pressOf(key), repeat: true }, { level, overlay: 'none' });
    expect(held).toEqual(key.repeats ? key.action : { type: 'swallow' });
  });
});

describe('ajuda', () => {
  it('mostra toda linha da tabela, uma vez', () => {
    const rows = helpSections().flatMap((section) => section.rows);
    expect(rows).toHaveLength(KEYS.length);
    expect(new Set(rows)).toEqual(new Set(KEYS));
  });

  it('segue os grupos de teclado.md', () => {
    expect(helpSections().map((section) => section.group)).toEqual([
      'Telas',
      'Foco e movimento',
      'Blocos',
      'Sistema',
      'Slides',
      'Treino',
      'Editor',
    ]);
  });
});

describe('listas da ajuda', () => {
  const total = helpLines().length;

  it('juntam teclas iguais, sem perder nenhuma', () => {
    const labels = helpLines().flatMap((line) => line.labels);
    expect(total).toBeLessThan(KEYS.length);
    expect(labels).toContain('Alt H J K L');
  });

  it('Todos tem tudo; Universais e Só desta tela se completam', () => {
    for (const screen of ['hub', 'mesa', 'treino', 'agenda'] as const) {
      expect(linesOf('all', screen)).toHaveLength(total);
      const sum = linesOf('universal', screen).length + linesOf('screen', screen).length;
      expect(sum).toBeLessThanOrEqual(total);
    }
  });

  it('Treino só aparece no Treino; Agenda e Configs não têm atalho só deles', () => {
    expect(groupLines(linesOf('screen', 'treino')).map((s) => s.group)).toEqual(['Treino']);
    expect(linesOf('screen', 'agenda')).toHaveLength(0);
    expect(linesOf('screen', 'configs')).toHaveLength(0);
  });
});
