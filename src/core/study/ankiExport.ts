// Preparação da exportação para o Anki (B02, D139): cada marca do texto vira HTML simples
// que o Anki preserva. Só funções puras; a tela de exportar vem depois.
import { hasCloze } from './cloze';
import { backBlocks, spans, type BackLine, type Span } from './cardText';

const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TAGS: Record<Span['style'], readonly [string, string]> = {
  plain: ['', ''],
  bold: ['<b>', '</b>'],
  italic: ['<i>', '</i>'],
  underline: ['<u>', '</u>'],
  mark: ['<span style="background-color:#fff3a0">', '</span>'],
  sup: ['<sup>', '</sup>'],
  sub: ['<sub>', '</sub>'],
};

export function inlineHtml(text: string): string {
  return spans(text)
    .map((span) => TAGS[span.style][0] + escape(span.text) + TAGS[span.style][1])
    .join('');
}

const SIGNS: Partial<Record<BackLine['kind'], string>> = { pro: '+ ', con: '− ', doubt: '? ' };

// Agrupa linhas seguidas do mesmo tipo de lista em um só <ul> ou <ol>.
function linesHtml(lines: readonly BackLine[]): string {
  const out: string[] = [];
  let open: 'ul' | 'ol' | null = null;
  const close = (): void => {
    if (open) out.push(`</${open}>`);
    open = null;
  };
  for (const line of lines) {
    // Exportação para o Anki sem imagens por enquanto (D158).
    if (line.kind === 'image') continue;
    const list = line.kind === 'item' ? 'ul' : line.kind === 'number' ? 'ol' : null;
    if (list !== open) {
      close();
      if (list) out.push(`<${list}>`);
      open = list;
    }
    const body = inlineHtml(line.text);
    out.push(list ? `<li>${body}</li>` : `<div>${(SIGNS[line.kind] ?? '') + body}</div>`);
  }
  close();
  return out.join('');
}

export function backHtml(back: string): string {
  return backBlocks(back)
    .map((block) => {
      const title = block.title === null ? '' : `<div><b>${inlineHtml(block.title.toUpperCase())}</b></div>`;
      const subs = block.subs
        .map(
          (sub) =>
            `<div style="margin-left:8px"><div style="color:#6b7280">${inlineHtml(sub.title)}</div>${linesHtml(sub.lines)}</div>`,
        )
        .join('');
      return title + linesHtml(block.lines) + subs;
    })
    .join('');
}

// Texto separado por tabulação, uma linha por cartão, como o Anki importa ("Frente<TAB>Verso").
// Cloze (D157) já está no formato do Anki, "{{c1::resposta}}", no primeiro campo. Quando todos os cartões
// são cloze, o cabeçalho pede o tipo "Cloze" ao importar; misturados, ficam no formato básico.
export function ankiTsv(cards: readonly { question: string; answer: string }[]): string {
  const cell = (html: string): string => html.replace(/[\t\r\n]+/g, ' ');
  const rows = cards.map((card) => `${cell(inlineHtml(card.question))}\t${cell(backHtml(card.answer))}`).join('\n');
  const allCloze = cards.length > 0 && cards.every((card) => hasCloze(card.question));
  return allCloze ? `#separator:tab\n#html:true\n#notetype:Cloze\n${rows}` : rows;
}
