// Edição por linha do cartão novo (D138): o cartão aparece pronto e só a linha do cursor mostra o texto
// para editar. Funções puras sobre o texto inteiro; "caret" é a posição na linha crua (com a marca).
import { parseLine } from './cardText';

export interface LineEdit {
  source: string;
  line: number;
  caret: number;
}

export const splitLines = (source: string): string[] => source.replace(/\r\n?/g, '\n').split('\n');

// Tamanho da marca no começo da linha ("@ ", "## ", "- ", "1. "); zero se não houver.
export function markLength(raw: string): number {
  const { kind, text } = parseLine(raw);
  if (kind === 'image') return raw.length;
  return kind === 'text' ? 0 : raw.length - text.length;
}

const LIST_KINDS = new Set(['item', 'number', 'pro', 'con', 'doubt', 'more']);

// Marca que a linha de baixo herda ao dar Enter: só as listas continuam (números contam +1).
function continuation(raw: string): string {
  const { kind } = parseLine(raw);
  if (kind === 'front' || kind === 'more') return '@@ ';
  if (!LIST_KINDS.has(kind)) return '';
  const mark = raw.slice(0, markLength(raw));
  if (kind !== 'number') return mark.endsWith(' ') ? mark : `${mark} `;
  const found = /^(\d+)([.)])\s?/.exec(raw);
  return found ? `${Number(found[1]) + 1}${found[2]} ` : '';
}

// Enter: parte a linha no cursor. Numa lista vazia, tira a marca em vez de abrir outra linha.
export function splitAt(source: string, line: number, start: number, end: number): LineEdit {
  const lines = splitLines(source);
  const raw = lines[line] ?? '';
  const prefix = markLength(raw);
  const from = Math.max(start, prefix);
  const emptyList = LIST_KINDS.has(parseLine(raw).kind) && raw.slice(prefix).trim() === '';
  if (emptyList) {
    lines[line] = '';
    return { source: lines.join('\n'), line, caret: 0 };
  }
  const next = continuation(raw);
  lines.splice(line, 1, raw.slice(0, from), next + raw.slice(Math.max(end, from)));
  return { source: lines.join('\n'), line: line + 1, caret: next.length };
}

// Backspace no começo do texto: primeiro tira a marca; sem marca, junta com a linha de cima.
export function backspaceAtStart(source: string, line: number): LineEdit | null {
  const lines = splitLines(source);
  const raw = lines[line] ?? '';
  const prefix = markLength(raw);
  // Linha de continuação da frente: sobe o texto para a linha de cima.
  if (parseLine(raw).kind === 'more' && line > 0) {
    const up = lines[line - 1] ?? '';
    lines.splice(line - 1, 2, up + raw.slice(prefix));
    return { source: lines.join('\n'), line: line - 1, caret: up.length };
  }
  if (prefix > 0) {
    lines[line] = raw.slice(prefix);
    return { source: lines.join('\n'), line, caret: 0 };
  }
  if (line === 0) return null;
  const above = lines[line - 1] ?? '';
  // Linha de imagem em cima (D158): não junta texto nela; o cursor sobe para a imagem.
  if (parseLine(above).kind === 'image') return { source, line: line - 1, caret: 0 };
  lines.splice(line - 1, 2, above + raw);
  return { source: lines.join('\n'), line: line - 1, caret: above.length };
}

// Linha e posição na linha de um deslocamento do texto inteiro.
export function locate(source: string, offset: number): { line: number; caret: number } {
  const before = source.slice(0, Math.max(0, offset)).split('\n');
  return { line: before.length - 1, caret: before.at(-1)?.length ?? 0 };
}

export function offsetOf(source: string, line: number, caret: number): number {
  const lines = splitLines(source);
  const start = lines.slice(0, line).reduce((sum, item) => sum + item.length + 1, 0);
  return start + Math.min(caret, lines[line]?.length ?? 0);
}

export interface CardGroup {
  // Linha do texto inteiro onde o cartão começa (a frente).
  first: number;
  lines: number[];
}

// Cada "@" abre um cartão; o texto antes do primeiro "@" também vira um (como no salvar).
export function groupLines(source: string): CardGroup[] {
  const groups: CardGroup[] = [];
  splitLines(source).forEach((raw, index) => {
    if (groups.length === 0 || parseLine(raw).kind === 'front') groups.push({ first: index, lines: [] });
    groups.at(-1)?.lines.push(index);
  });
  return groups;
}

// Linhas do texto que são a frente do cartão: a que abre ("@") e as continuações ("@@").
export const frontLines = (source: string, group: CardGroup): number[] => {
  const all = splitLines(source);
  return group.lines.filter((index) => index === group.first || parseLine(all[index] ?? '').kind === 'more');
};

// Abre uma linha comum (sem marca) logo abaixo de `line`: é como o verso nasce.
export function insertBlankAfter(source: string, line: number): LineEdit {
  const lines = splitLines(source);
  lines.splice(line + 1, 0, '');
  return { source: lines.join('\n'), line: line + 1, caret: 0 };
}
