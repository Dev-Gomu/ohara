import type { Level, Resolved } from './actions';
import { ADJUST_KEYS, KEYS, LINE_KEYS, OPTION_KEYS, type KeyRow, type LineSpot, type Mods } from './keys';

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
  if (context.choosing && context.level === 'nav' && context.overlay === 'none' && mods === '') {
    const option = OPTION_KEYS.find((key) => key.code === input.code);
    if (option) return option.action;
  }
  if (context.cardLine && context.overlay === 'none' && mods === '') {
    const line = LINE_KEYS.find((key) => key.code === input.code && context.cardLine?.includes(key.when));
    if (line) return line.action;
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
