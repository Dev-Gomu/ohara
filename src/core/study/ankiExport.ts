// Preparação da exportação para o Anki (B02, D139): cada marca do texto vira HTML simples
// que o Anki preserva. Só funções puras; a tela de exportar vem depois.
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
export function ankiTsv(cards: readonly { question: string; answer: string }[]): string {
  const cell = (html: string): string => html.replace(/[\t\r\n]+/g, ' ');
  return cards.map((card) => `${cell(inlineHtml(card.question))}\t${cell(backHtml(card.answer))}`).join('\n');
}
