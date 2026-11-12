// Texto do editor de cartões. Cada cartão começa numa linha "@ frente"; as linhas
// seguintes são o verso. Marcas no começo da linha dão forma ao verso, como no app antigo.
// Tudo fica em texto puro: quem desenha é a tela, sem HTML vindo do usuário.

export type LineKind = 'front' | 'section' | 'item' | 'number' | 'pro' | 'con' | 'doubt' | 'text';

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

export interface Span {
  text: string;
  style: 'plain' | 'bold' | 'mark';
}

// **negrito** e ==destaque== dentro da linha.
export function spans(text: string): Span[] {
  const result: Span[] = [];
  const pattern = /\*\*([^*]+)\*\*|==([^=]+)==/g;
  let last = 0;
  for (const found of text.matchAll(pattern)) {
    if (found.index > last) result.push({ text: text.slice(last, found.index), style: 'plain' });
    const [, bold, mark] = found;
    if (bold !== undefined) result.push({ text: bold, style: 'bold' });
    if (mark !== undefined) result.push({ text: mark, style: 'mark' });
    last = found.index + found[0].length;
  }
  if (last < text.length) result.push({ text: text.slice(last), style: 'plain' });
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
