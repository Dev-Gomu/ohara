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

export function formatCard(edit: Edit, format: CardFormat): Edit {
  const marker = MARKERS[format];
  if (marker) return wrap(edit, marker);
  return toggleLines(edit, format === 'bulletList' ? 'bulletList' : 'orderedList');
}
