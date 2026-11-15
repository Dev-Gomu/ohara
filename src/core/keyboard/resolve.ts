import type { Level, Resolved } from './actions';
import {
  ADJUST_KEYS,
  HELP_KEYS,
  KEYS,
  LINE_KEYS,
  OPTION_KEYS,
  TABLE_KEYS,
  TRASH_KEYS,
  type KeyRow,
  type LineSpot,
  type Mods,
  type TrashSpot,
} from './keys';

export interface KeyInput {
  code: string;
  key: string;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  altGraph: boolean;
  isComposing: boolean;
  repeat: boolean;
}

export type Overlay = 'none' | 'window' | 'menu';

export interface KeyContext {
  level: Level;
  overlay: Overlay;
  // Modo Ajustar da tabela: setas, Enter e Esc passam a ser dele.
  adjusting?: boolean;
  // Cursor numa linha do cartão novo: onde ele está na linha decide se Enter, Backspace e setas são do cartão.
  cardLine?: readonly LineSpot[];
  // A linha acesa tem opções curtas: ← → trocam a opção em vez de ir ao bloco vizinho.
  choosing?: boolean;
  // Janela da Lixeira aberta: onde está o foco dentro dela.
  trash?: TrashSpot;
  // Cursor numa tabela das Anotações: Alt Shift + setas e Alt ⌫ viram comandos da tabela.
  inTable?: boolean;
  // Qual janela está aberta (só a Ajuda usa: ← → trocam de lista).
  window?: string | null;
}

function modsOf(input: KeyInput): string {
  return `${input.ctrl ? 'c' : ''}${input.alt ? 'a' : ''}${input.shift ? 's' : ''}`;
}

// No ABNT2 o AltGr digita ¹ ² ³ e /, e pode chegar como Ctrl+Alt. Acentos e o teclado
// virtual do Android chegam como composição, "Dead" ou sem code.
function isText(input: KeyInput): boolean {
  return (
    input.meta || input.altGraph || input.isComposing || input.key === 'Dead' || input.code === ''
  );
}

// Teclas soltas seguem para a janela (a Paleta usa setas e digitação). F1 é a exceção:
// seguindo adiante, abriria a ajuda do navegador.
function belongsToWindow(mods: Mods, code: string): boolean {
  return mods === '' && code !== 'F1';
}

function resolveInOverlay(input: KeyInput, rows: readonly KeyRow[]): Resolved | null {
  const row = rows[0];
  if (!row) return null;
  if (row.action.type === 'escape') return input.repeat ? { type: 'swallow' } : row.action;
  return belongsToWindow(row.mods, row.code) ? null : { type: 'swallow' };
}

export function resolve(
  input: KeyInput,
  context: KeyContext,
  keys: readonly KeyRow[] = KEYS,
): Resolved | null {
  if (isText(input)) return null;
  const mods = modsOf(input);
  if (context.adjusting && context.overlay === 'none') {
    const adjust = ADJUST_KEYS.find(
      (key) => key.code === input.code && key.shift === input.shift && mods === (input.shift ? 's' : ''),
    );
    if (adjust) return input.repeat && adjust.action.type === 'tableAdjustEnd' ? { type: 'swallow' } : adjust.action;
  }
  if (context.inTable && context.level === 'field' && context.overlay === 'none') {
    const table = TABLE_KEYS.find((key) => key.code === input.code && key.mods === mods);
    if (table) return input.repeat ? { type: 'swallow' } : table.action;
  }
  if (context.choosing && context.level === 'nav' && context.overlay === 'none' && mods === '') {
    const option = OPTION_KEYS.find((key) => key.code === input.code);
    if (option) return option.action;
  }
  if (context.cardLine && context.overlay === 'none' && (mods === '' || mods === 's')) {
    const line = LINE_KEYS.find(
      (key) =>
        key.code === input.code && (key.shift ?? false) === (mods === 's') && context.cardLine?.includes(key.when),
    );
    if (line) return line.action;
  }
  if (context.trash && context.overlay === 'window' && (mods === '' || mods === 'a')) {
    const spot = context.trash;
    const own = TRASH_KEYS.find(
      (key) => key.code === input.code && key.alt === (mods === 'a') && key.when.includes(spot),
    );
    if (own) return input.repeat && !own.repeats ? { type: 'swallow' } : own.action;
  }
  if (context.window === 'help' && context.overlay === 'window' && mods === '') {
    const help = HELP_KEYS.find((key) => key.code === input.code);
    if (help) return input.repeat ? { type: 'swallow' } : help.action;
  }
  const rows = keys.filter((key) => key.code === input.code && key.mods === mods);
  if (context.overlay !== 'none') return resolveInOverlay(input, rows);
  const row = rows.find((key) => key.levels.includes(context.level));
  if (!row) return null;
  // Engolir, e não devolver nulo: senão, segurar Alt F ou Ctrl P entregaria a repetição
  // ao navegador, que abriria o menu ou a impressão.
  if (input.repeat && !row.repeats) return { type: 'swallow' };
  return row.action;
}
