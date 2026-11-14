// Texto do editor de cartões. Cada cartão começa numa linha "@ frente"; as linhas
// seguintes são o verso. Marcas no começo da linha dão forma ao verso, como no app antigo.
// Tudo fica em texto puro: quem desenha é a tela, sem HTML vindo do usuário.
import { replaceSymbols } from './symbols';

export type LineKind = 'front' | 'section' | 'subsection' | 'item' | 'number' | 'pro' | 'con' | 'doubt' | 'text';

export interface Line {
  kind: LineKind;
  text: string;
}

export interface Draft {
  front: string;
  back: string;
}

// A ordem importa: "--" antes de "-". Lista exige espaço, para "-5 mmHg" e "1.5 mg" não virarem lista.
const MARKS: readonly [LineKind, RegExp][] = [
  ['front', /^@\s?/],
  ['subsection', /^##\s?/],
  ['section', /^#\s?/],
  ['con', /^--\s/],
  ['pro', /^\+\s/],
  ['doubt', /^\?\s?/],
  ['item', /^[-*]\s/],
  ['number', /^\d+[.)]\s/],
];

export function parseLine(line: string): Line {
  for (const [kind, mark] of MARKS) {
    const found = mark.exec(line);
    if (found) return { kind, text: line.slice(found[0].length) };
  }
  return { kind: 'text', text: line };
}

const lines = (source: string): string[] => source.replace(/\r\n?/g, '\n').split('\n');

// Texto antes do primeiro "@" também vira cartão: a primeira linha é a frente.
export function parseDrafts(source: string): Draft[] {
  const drafts: { front: string; back: string[] }[] = [];
  for (const raw of lines(source)) {
    const line = parseLine(raw);
    const current = drafts.at(-1);
    if (line.kind === 'front') drafts.push({ front: line.text.trim(), back: [] });
    else if (current) current.back.push(raw);
    else if (raw.trim()) drafts.push({ front: raw.trim(), back: [] });
  }
  return drafts
    .map((draft) => ({ front: draft.front, back: draft.back.join('\n').trim() }))
    .filter((draft) => draft.front || draft.back);
}

export const isComplete = (draft: Draft): boolean => draft.front !== '' && draft.back !== '';

export interface BackLine extends Line {
  // Posição na lista numerada atual; recomeça a cada lista.
  position: number;
}

export function backLines(back: string): BackLine[] {
  let position = 0;
  return lines(back)
    .filter((raw) => raw.trim() !== '')
    .map((raw) => {
      const line = parseLine(raw);
      position = line.kind === 'number' ? position + 1 : 0;
      return { ...line, position };
    });
}

// Começo do verso em uma linha, para a lista de salvos: só o texto, sem os títulos.
export function backPreview(back: string): string {
  return backLines(back)
    .filter((line) => line.kind !== 'section' && line.kind !== 'subsection')
    .map((line) => line.text)
    .join(' · ');
}

export interface BackBlock {
  // "# Seção"; null para as linhas que vêm antes da primeira seção.
  title: string | null;
  lines: BackLine[];
  // "## Subtítulo" abre um sub-bloco dentro da seção.
  subs: { title: string; lines: BackLine[] }[];
}

export function backBlocks(back: string): BackBlock[] {
  const blocks: BackBlock[] = [];
  for (const line of backLines(back)) {
    if (line.kind === 'section') {
      blocks.push({ title: line.text, lines: [], subs: [] });
      continue;
    }
    if (blocks.length === 0) blocks.push({ title: null, lines: [], subs: [] });
    const block = blocks[blocks.length - 1];
    if (!block) continue;
    if (line.kind === 'subsection') block.subs.push({ title: line.text, lines: [] });
    else (block.subs.at(-1)?.lines ?? block.lines).push(line);
  }
  return blocks;
}

export interface Span {
  text: string;
  style: 'plain' | 'bold' | 'italic' | 'underline' | 'mark' | 'sup' | 'sub';
}

// Marcas dentro da linha (D139). "~5 mg" e "2 * 3" não casam: a marca não pode ter espaço colado por dentro.
const INLINE: readonly [Span['style'], string][] = [
  ['bold', String.raw`\*\*([^*]+)\*\*`],
  ['underline', String.raw`__([^_]+)__`],
  ['mark', String.raw`==([^=]+)==`],
  ['italic', String.raw`\*([^*\s](?:[^*]*[^*\s])?)\*`],
  ['sup', String.raw`\^([^^\s](?:[^^]*[^^\s])?)\^`],
  ['sub', String.raw`~([^~\s](?:[^~]*[^~\s])?)~`],
];
const INLINE_PATTERN = new RegExp(INLINE.map(([, source]) => source).join('|'), 'g');

export function spans(text: string): Span[] {
  const result: Span[] = [];
  const plain = (chunk: string): void => {
    if (chunk) result.push({ text: replaceSymbols(chunk), style: 'plain' });
  };
  let last = 0;
  for (const found of text.matchAll(INLINE_PATTERN)) {
    plain(text.slice(last, found.index));
    const group = INLINE.findIndex((_, index) => found[index + 1] !== undefined);
    const style = INLINE[group]?.[0];
    if (style) result.push({ text: replaceSymbols(found[group + 1] ?? ''), style });
    last = found.index + found[0].length;
  }
  plain(text.slice(last));
  return result;
}

// Alt N: abre um cartão novo no fim, com uma linha em branco antes, se preciso.
export function appendCard(source: string): { source: string; caret: number } {
  const trimmed = source.replace(/\s+$/, '');
  const next = trimmed === '' ? '@ ' : `${trimmed}\n\n@ `;
  return { source: next, caret: next.length };
}

// Depois de salvar, ficam só os rascunhos incompletos, para o usuário terminar.
export function keepIncomplete(drafts: readonly Draft[]): string {
  return drafts
    .filter((draft) => !isComplete(draft))
    .map((draft) => (draft.back ? `@ ${draft.front}\n${draft.back}` : `@ ${draft.front}`))
    .join('\n\n');
}
