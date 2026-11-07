import { SCREENS as SCREEN_IDS } from './actions';
import type { BlockKind, Direction, KeyAction, Level, Screen } from './actions';

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
}

const ALL: readonly Level[] = ['menu', 'block', 'field', 'nav'];
const OUTSIDE_TEXT: readonly Level[] = ['menu', 'block', 'nav'];
const BLOCK_FIELD: readonly Level[] = ['block', 'field', 'nav'];
const FIELD: readonly Level[] = ['field'];
const NAV: readonly Level[] = ['nav'];

const row = (
  group: KeyGroup,
  label: string,
  code: string,
  mods: Mods,
  levels: readonly Level[],
  action: KeyAction,
  text: string,
  repeats = false,
): KeyRow => ({ group, label, code, mods, levels, action, text, repeats });

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
  row('Blocos', 'Alt R', 'KeyR', 'a', BLOCK_FIELD, { type: 'resizeMode' }, 'Modo de redimensionar'),
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
  row('Blocos', 'Alt T', 'KeyT', 'a', BLOCK_FIELD, { type: 'goToTopBar' }, 'Vai à barra de cima'),
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
];
