import { SCREENS as SCREEN_IDS } from './actions';
import type { BlockKind, Direction, KeyAction, Level, Screen } from './actions';
import { SIZE_BIG_STEP, SIZE_STEP } from '../notes/tableSize';

// a = Alt, c = Ctrl, s = Shift
export type Mods = '' | 'a' | 'c' | 's' | 'as' | 'ca' | 'cs';
export type KeyGroup =
  'Telas' | 'Foco e movimento' | 'Blocos' | 'Sistema' | 'Slides' | 'Treino' | 'Editor';

export interface KeyRow {
  group: KeyGroup;
  label: string; // o que está impresso no teclado ABNT2
  code: string; // posição física: o nome é de teclado americano e engana
  mods: Mods;
  levels: readonly Level[];
  action: KeyAction;
  text: string;
  repeats: boolean; // age ao segurar a tecla
  screens: readonly Screen[] | 'all'; // em que telas a tecla existe
}

const ALL: readonly Level[] = ['menu', 'block', 'field', 'nav'];
const OUTSIDE_TEXT: readonly Level[] = ['menu', 'block', 'nav'];
const BLOCK_FIELD: readonly Level[] = ['block', 'field', 'nav'];
const FIELD: readonly Level[] = ['field'];
const NAV: readonly Level[] = ['nav'];

// Só estes grupos são de algumas telas; o resto vale em todas.
const GROUP_SCREENS: Readonly<Partial<Record<KeyGroup, readonly Screen[]>>> = {
  Blocos: ['hub', 'mesa', 'acervo'],
  Slides: ['mesa', 'acervo'],
  Editor: ['mesa', 'acervo'],
  Treino: ['treino'],
};

const row = (
  group: KeyGroup,
  label: string,
  code: string,
  mods: Mods,
  levels: readonly Level[],
  action: KeyAction,
  text: string,
  repeats = false,
): KeyRow => ({
  group,
  label,
  code,
  mods,
  levels,
  action,
  text,
  repeats,
  screens: GROUP_SCREENS[group] ?? 'all',
});

export const SCREEN_NAMES: Readonly<Record<Screen, string>> = {
  hub: 'Hub',
  mesa: 'Mesa',
  acervo: 'Acervo',
  treino: 'Treino',
  agenda: 'Agenda',
  configs: 'Configs',
};

type DirectionKey = readonly [string, string, Direction, string];

const LETTERS: readonly DirectionKey[] = [
  ['H', 'KeyH', 'left', 'esquerda'],
  ['J', 'KeyJ', 'down', 'baixo'],
  ['K', 'KeyK', 'up', 'cima'],
  ['L', 'KeyL', 'right', 'direita'],
];

const ARROWS: readonly DirectionKey[] = [
  ['←', 'ArrowLeft', 'left', 'esquerda'],
  ['↓', 'ArrowDown', 'down', 'baixo'],
  ['↑', 'ArrowUp', 'up', 'cima'],
  ['→', 'ArrowRight', 'right', 'direita'],
];

const TOGGLES: readonly [string, string, BlockKind, string][] = [
  ['S', 'KeyS', 'slides', 'Slides'],
  ['A', 'KeyA', 'notes', 'Anotações'],
  ['C', 'KeyC', 'cards', 'Cartões'],
];

const HEADINGS = [1, 2, 3] as const;

const GRADES = [
  [1, 'Errei'],
  [2, 'Difícil'],
  [3, 'Bom'],
  [4, 'Fácil'],
] as const;

export const KEYS: readonly KeyRow[] = [
  ...SCREEN_IDS.map((screen, i) =>
    row(
      'Telas',
      `Alt ${i + 1}`,
      `Digit${i + 1}`,
      'a',
      ALL,
      { type: 'goToScreen', screen },
      SCREEN_NAMES[screen],
    ),
  ),

  ...[...LETTERS, ...ARROWS].map(([label, code, direction, text]) =>
    row(
      'Foco e movimento',
      `Alt ${label}`,
      code,
      'a',
      ALL,
      { type: 'moveFocus', direction },
      `Foco para ${text}`,
      true,
    ),
  ),
  ...LETTERS.map(([label, code, direction, text]) =>
    row(
      'Foco e movimento',
      `Alt Shift ${label}`,
      code,
      'as',
      BLOCK_FIELD,
      { type: 'swapBlock', direction },
      `Troca o bloco com o vizinho: ${text}`,
    ),
  ),
  ...[...LETTERS, ...ARROWS].map(([label, code, direction, text]) =>
    row(
      'Foco e movimento',
      label,
      code,
      '',
      OUTSIDE_TEXT,
      { type: 'moveFocus', direction, step: true },
      `Bloco vizinho ou próximo item: ${text}`,
      true,
    ),
  ),
  row('Foco e movimento', 'Enter', 'Enter', '', OUTSIDE_TEXT, { type: 'enter' }, 'Desce um nível'),
  row('Foco e movimento', 'Esc', 'Escape', '', ALL, { type: 'escape' }, 'Fecha ou sobe um nível'),
  row(
    'Foco e movimento',
    'Tab',
    'Tab',
    '',
    OUTSIDE_TEXT,
    { type: 'nextBlock' },
    'Próximo bloco',
    true,
  ),
  row(
    'Foco e movimento',
    'Shift Tab',
    'Tab',
    's',
    OUTSIDE_TEXT,
    { type: 'previousBlock' },
    'Bloco anterior',
    true,
  ),

  ...TOGGLES.map(([letter, code, block, name]) =>
    row(
      'Blocos',
      `Alt ${letter}`,
      code,
      'a',
      ALL,
      { type: 'toggleBlock', block },
      `Abre ou fecha ${name}`,
    ),
  ),
  row('Blocos', 'Alt M', 'KeyM', 'a', BLOCK_FIELD, { type: 'maximizeBlock' }, 'Amplia o bloco'),
  row('Blocos', 'Alt W', 'KeyW', 'a', BLOCK_FIELD, { type: 'closeBlock' }, 'Fecha o bloco'),
  row('Blocos', 'Alt R', 'KeyR', 'a', BLOCK_FIELD, { type: 'resizeMode' }, 'Modo de redimensionar; na tabela, modo Ajustar'),
  row(
    'Blocos',
    'Alt X',
    'KeyX',
    'a',
    BLOCK_FIELD,
    { type: 'swapHiddenBlock' },
    'Troca pelo bloco escondido',
  ),
  row('Blocos', 'Alt O', 'KeyO', 'a', BLOCK_FIELD, { type: 'openOptions' }, 'Opções (⋮) do bloco'),
  row(
    'Blocos',
    'Alt T',
    'KeyT',
    'a',
    BLOCK_FIELD,
    { type: 'goToTopBar' },
    'Barra de cima; nas Anotações, a de formatação',
  ),
  row('Blocos', 'Alt F', 'KeyF', 'a', BLOCK_FIELD, { type: 'goToField' }, 'Vai ao campo'),
  row(
    'Blocos',
    'Alt B',
    'KeyB',
    'a',
    BLOCK_FIELD,
    { type: 'goToBottomBar' },
    'Vai à barra de baixo',
  ),
  row(
    'Blocos',
    'Alt ,',
    'Comma',
    'a',
    BLOCK_FIELD,
    { type: 'previousControl' },
    'Controle anterior na barra',
    true,
  ),
  row(
    'Blocos',
    'Alt .',
    'Period',
    'a',
    BLOCK_FIELD,
    { type: 'nextControl' },
    'Próximo controle na barra',
    true,
  ),
  row('Blocos', 'Alt N', 'KeyN', 'a', BLOCK_FIELD, { type: 'newItem' }, 'Novo item no bloco'),
  row('Blocos', 'Alt 0', 'Digit0', 'a', BLOCK_FIELD, { type: 'defaultSizes' }, 'Tamanhos padrão'),
  row(
    'Blocos',
    'Alt Shift 0',
    'Digit0',
    'as',
    BLOCK_FIELD,
    { type: 'defaultOrder' },
    'Ordem padrão',
  ),

  row('Sistema', 'Alt P', 'KeyP', 'a', ALL, { type: 'openPalette' }, 'Paleta: ir para…'),
  row('Sistema', 'Ctrl P', 'KeyP', 'c', ALL, { type: 'openPalette' }, 'Paleta: ir para…'),
  row('Sistema', 'Alt I', 'KeyI', 'a', ALL, { type: 'quickReminder' }, 'Lembrete rápido'),
  row('Sistema', 'Alt D', 'KeyD', 'a', ALL, { type: 'toggleTheme' }, 'Troca o tema (claro ou escuro)'),
  row('Sistema', 'Alt Z', 'KeyZ', 'a', ALL, { type: 'undo' }, 'Desfaz a última exclusão'),
  row('Sistema', 'Alt /', 'IntlRo', 'a', ALL, { type: 'openHelp' }, 'Ajuda'),
  row('Sistema', 'F1', 'F1', '', ALL, { type: 'openHelp' }, 'Ajuda'),

  row(
    'Slides',
    'Alt [',
    'BracketRight',
    'a',
    ALL,
    { type: 'changePage', step: -1 },
    'Página anterior',
    true,
  ),
  row(
    'Slides',
    'Alt ]',
    'Backslash',
    'a',
    ALL,
    { type: 'changePage', step: 1 },
    'Próxima página',
    true,
  ),
  row(
    'Slides',
    'Alt Page Up',
    'PageUp',
    'a',
    ALL,
    { type: 'changePage', step: -1 },
    'Página anterior',
    true,
  ),
  row(
    'Slides',
    'Alt Page Down',
    'PageDown',
    'a',
    ALL,
    { type: 'changePage', step: 1 },
    'Próxima página',
    true,
  ),

  row('Treino', 'Espaço', 'Space', '', NAV, { type: 'flipCard' }, 'Vira o cartão'),
  ...GRADES.map(([grade, name]) =>
    row('Treino', String(grade), `Digit${grade}`, '', NAV, { type: 'rateCard', grade }, name),
  ),

  row('Editor', 'Ctrl B', 'KeyB', 'c', FIELD, { type: 'bold' }, 'Negrito'),
  row('Editor', 'Ctrl I', 'KeyI', 'c', FIELD, { type: 'italic' }, 'Itálico'),
  row('Editor', 'Ctrl U', 'KeyU', 'c', FIELD, { type: 'underline' }, 'Sublinhado'),
  row('Editor', 'Ctrl K', 'KeyK', 'c', FIELD, { type: 'link' }, 'Link'),
  row('Editor', 'Ctrl E', 'KeyE', 'c', FIELD, { type: 'code' }, 'Código'),
  row(
    'Editor',
    'Ctrl M',
    'KeyM',
    'c',
    FIELD,
    { type: 'markSlidePage' },
    'Marcar a página do slide',
  ),
  row('Editor', 'Ctrl Shift H', 'KeyH', 'cs', FIELD, { type: 'highlight' }, 'Marca-texto'),
  row('Editor', 'Ctrl Shift X', 'KeyX', 'cs', FIELD, { type: 'strikethrough' }, 'Riscado'),
  row('Editor', 'Ctrl .', 'Period', 'c', FIELD, { type: 'superscript' }, 'Sobrescrito'),
  row('Editor', 'Ctrl ,', 'Comma', 'c', FIELD, { type: 'subscript' }, 'Subscrito'),
  ...HEADINGS.map((level) =>
    row(
      'Editor',
      `Ctrl Alt ${level}`,
      `Digit${level}`,
      'ca',
      FIELD,
      { type: 'heading', level },
      `Título ${level}`,
    ),
  ),
  row('Editor', 'Ctrl Shift 7', 'Digit7', 'cs', FIELD, { type: 'orderedList' }, 'Lista numerada'),
  row(
    'Editor',
    'Ctrl Shift 8',
    'Digit8',
    'cs',
    FIELD,
    { type: 'bulletList' },
    'Lista com marcadores',
  ),
  row('Editor', 'Ctrl Shift 9', 'Digit9', 'cs', FIELD, { type: 'taskList' }, 'Lista de tarefas'),
  row('Editor', 'Ctrl Enter', 'Enter', 'c', FIELD, { type: 'saveCards' }, 'Salvar cartões'),
  row('Editor', 'Ctrl Shift C', 'KeyC', 'cs', FIELD, { type: 'cloze' }, 'Cartão: nova lacuna (cloze)'),
  row('Editor', 'Ctrl Alt C', 'KeyC', 'ca', FIELD, { type: 'clozeSame' }, 'Cartão: outra lacuna, mesmo número'),
];

// Só valem com o modo Ajustar da tabela ligado (D149); por isso ficam fora de KEYS.
export interface AdjustRow {
  label: string;
  code: string;
  shift: boolean;
  action: KeyAction;
}

const ADJUST_ARROWS = [
  ['←', 'ArrowLeft', 'width', -1],
  ['→', 'ArrowRight', 'width', 1],
  ['↑', 'ArrowUp', 'height', -1],
  ['↓', 'ArrowDown', 'height', 1],
] as const;

export const ADJUST_KEYS: readonly AdjustRow[] = [
  ...ADJUST_ARROWS.flatMap(([label, code, axis, sign]) => [
    { label, code, shift: false, action: { type: 'tableAdjust', axis, delta: sign * SIZE_STEP } },
    {
      label: `Shift ${label}`,
      code,
      shift: true,
      action: { type: 'tableAdjust', axis, delta: sign * SIZE_BIG_STEP },
    },
  ] as const),
  { label: 'Enter', code: 'Enter', shift: false, action: { type: 'tableAdjustEnd' } },
  { label: 'Esc', code: 'Escape', shift: false, action: { type: 'tableAdjustEnd' } },
];

// Só valem com a linha acesa de uma lista que tem opções curtas (Configs, D160); por isso ficam fora de KEYS.
export interface OptionRow {
  label: string;
  code: string;
  action: KeyAction;
}

export const OPTION_KEYS: readonly OptionRow[] = [
  { label: '←', code: 'ArrowLeft', action: { type: 'optionStep', delta: -1 } },
  { label: '→', code: 'ArrowRight', action: { type: 'optionStep', delta: 1 } },
];

// Só valem com o cursor numa linha do cartão novo (D138); por isso ficam fora de KEYS. "when" diz em que
// ponto da linha a tecla é do cartão: Enter sempre; Backspace no começo do texto; ↑ na primeira linha visual
// (ou no começo); ↓ na última (ou no fim).
// 'image': o cursor está numa linha de imagem (D158), sem texto para editar.
export type LineSpot = 'any' | 'start' | 'top' | 'bottom' | 'image';

export interface LineRow {
  label: string;
  code: string;
  when: LineSpot;
  action: KeyAction;
}

export const LINE_KEYS: readonly LineRow[] = [
  { label: 'Enter', code: 'Enter', when: 'any', action: { type: 'cardLineSplit' } },
  { label: 'Backspace', code: 'Backspace', when: 'start', action: { type: 'cardLineBack' } },
  { label: '↑', code: 'ArrowUp', when: 'top', action: { type: 'cardLineMove', delta: -1 } },
  { label: '↓', code: 'ArrowDown', when: 'bottom', action: { type: 'cardLineMove', delta: 1 } },
  { label: 'Enter', code: 'Enter', when: 'image', action: { type: 'cardImageZoom' } },
  { label: 'Delete', code: 'Delete', when: 'image', action: { type: 'cardImageRemove' } },
  { label: 'Backspace', code: 'Backspace', when: 'image', action: { type: 'cardImageRemove' } },
];
