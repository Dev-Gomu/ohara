// Formatação do texto do editor de cartões por atalho (D139): as mesmas teclas das Anotações
// escrevem as marcas no texto. Funções puras sobre (texto, seleção).

export type CardFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'highlight'
  | 'superscript'
  | 'subscript'
  | 'bulletList'
  | 'orderedList';

export interface Edit {
  text: string;
  start: number;
  end: number;
}

const MARKERS: Partial<Record<CardFormat, string>> = {
  bold: '**',
  italic: '*',
  underline: '__',
  highlight: '==',
  superscript: '^',
  subscript: '~',
};

// Com a seleção já entre as marcas, tira; sem seleção, abre o par com o cursor no meio.
function wrap(edit: Edit, marker: string): Edit {
  const { text, start, end } = edit;
  const size = marker.length;
  const around = text.slice(start - size, start) === marker && text.slice(end, end + size) === marker;
  if (around) {
    return {
      text: text.slice(0, start - size) + text.slice(start, end) + text.slice(end + size),
      start: start - size,
      end: end - size,
    };
  }
  return {
    text: text.slice(0, start) + marker + text.slice(start, end) + marker + text.slice(end),
    start: start + size,
    end: end + size,
  };
}

const BULLET = /^[-*]\s/;
const NUMBER = /^\d+[.)]\s/;

// Marca cada linha tocada pela seleção; se todas já estão marcadas, desmarca.
function toggleLines(edit: Edit, kind: 'bulletList' | 'orderedList'): Edit {
  const { text, start, end } = edit;
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const stop = text.indexOf('\n', end);
  const to = stop === -1 ? text.length : stop;
  const lines = text.slice(from, to).split('\n');
  const pattern = kind === 'bulletList' ? BULLET : NUMBER;
  const allMarked = lines.every((line) => pattern.test(line));
  const next = lines.map((line, index) => {
    if (allMarked) return line.replace(pattern, '');
    const bare = line.replace(BULLET, '').replace(NUMBER, '');
    return (kind === 'bulletList' ? '- ' : `${index + 1}. `) + bare;
  });
  const joined = next.join('\n');
  return {
    text: text.slice(0, from) + joined + text.slice(to),
    start: from,
    end: from + joined.length,
  };
}

// Cloze (D157): envolve a seleção em "{{cN::…}}" ou abre o par com o cursor na resposta.
// O número vem da linha do cursor: o próximo livre, ou, com `same`, o maior já usado (outra lacuna do mesmo cartão).
export function insertCloze(edit: Edit, same: boolean): Edit {
  const { text, start, end } = edit;
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const stop = text.indexOf('\n', end);
  const line = text.slice(from, stop === -1 ? text.length : stop);
  const used = [...line.matchAll(/\{\{c(\d+)::/g)].map((found) => Number(found[1]));
  const top = Math.max(0, ...used);
  const number = same ? Math.max(1, top) : top + 1;
  const open = `{{c${number}::`;
  const selected = text.slice(start, end);
  const next = text.slice(0, start) + open + selected + '}}' + text.slice(end);
  const caret = selected === '' ? start + open.length : start + open.length + selected.length + 2;
  return { text: next, start: caret, end: caret };
}

export function formatCard(edit: Edit, format: CardFormat): Edit {
  const marker = MARKERS[format];
  if (marker) return wrap(edit, marker);
  return toggleLines(edit, format === 'bulletList' ? 'bulletList' : 'orderedList');
}
