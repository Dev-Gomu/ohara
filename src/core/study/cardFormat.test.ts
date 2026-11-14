import { describe, expect, it } from 'vitest';
import { formatCard, insertCloze } from './cardFormat';

describe('formatação do editor de cartões', () => {
  it('envolve a seleção com a marca', () => {
    expect(formatCard({ text: 'a IL-6 b', start: 2, end: 6 }, 'bold')).toEqual({
      text: 'a **IL-6** b',
      start: 4,
      end: 8,
    });
  });

  it('cada atalho escreve a sua marca', () => {
    const run = (format: Parameters<typeof formatCard>[1]) =>
      formatCard({ text: 'x', start: 0, end: 1 }, format).text;
    expect(run('italic')).toBe('*x*');
    expect(run('underline')).toBe('__x__');
    expect(run('highlight')).toBe('==x==');
    expect(run('superscript')).toBe('^x^');
    expect(run('subscript')).toBe('~x~');
  });

  it('sem seleção abre o par e deixa o cursor no meio', () => {
    expect(formatCard({ text: 'ab', start: 1, end: 1 }, 'bold')).toEqual({
      text: 'a****b',
      start: 3,
      end: 3,
    });
  });

  it('repetir o atalho sobre a seleção já marcada tira a marca', () => {
    expect(formatCard({ text: 'a **IL-6** b', start: 4, end: 8 }, 'bold')).toEqual({
      text: 'a IL-6 b',
      start: 2,
      end: 6,
    });
  });

  it('listas marcam as linhas tocadas e desmarcam ao repetir', () => {
    const numbered = formatCard({ text: 'x\nfebre\ntosse\ny', start: 3, end: 10 }, 'orderedList');
    expect(numbered.text).toBe('x\n1. febre\n2. tosse\ny');
    expect(formatCard(numbered, 'orderedList').text).toBe('x\nfebre\ntosse\ny');
    expect(formatCard({ text: 'febre', start: 0, end: 0 }, 'bulletList').text).toBe('- febre');
  });

  it('trocar de lista troca a marca da linha', () => {
    expect(formatCard({ text: '- febre', start: 0, end: 0 }, 'orderedList').text).toBe('1. febre');
  });
});

describe('insertCloze', () => {
  it('sem seleção abre o par com o cursor na resposta', () => {
    expect(insertCloze({ text: 'A  é', start: 2, end: 2 }, false)).toEqual({ text: 'A {{c1::}} é', start: 8, end: 8 });
  });

  it('envolve a seleção e põe o cursor depois', () => {
    const edit = insertCloze({ text: 'A IL-6 é', start: 2, end: 6 }, false);
    expect(edit.text).toBe('A {{c1::IL-6}} é');
    expect(edit.start).toBe(edit.text.indexOf(' é'));
  });

  it('numera pela linha do cursor: próximo livre ou o mesmo', () => {
    const text = '@ A {{c1::IL-6}} e {{c2::PCR}} x\nOutra {{c5::linha}}';
    const at = text.indexOf(' x');
    expect(insertCloze({ text, start: at, end: at }, false).text).toContain('{{c3::}}');
    expect(insertCloze({ text, start: at, end: at }, true).text).toContain('{{c2::}}');
  });
});
