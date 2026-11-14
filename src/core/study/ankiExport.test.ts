import { describe, expect, it } from 'vitest';
import { ankiTsv, backHtml, inlineHtml } from './ankiExport';

describe('exportação para o Anki', () => {
  it('converte as marcas inline em HTML e escapa o resto', () => {
    expect(inlineHtml('**a** *b* __c__ x^2^ H~2~O')).toBe('<b>a</b> <i>b</i> <u>c</u> x<sup>2</sup> H<sub>2</sub>O');
    expect(inlineHtml('a < b & c')).toBe('a &lt; b &amp; c');
    expect(inlineHtml('==x==')).toContain('background-color');
  });

  it('agrupa listas e mostra títulos', () => {
    const html = backHtml('# Causas\n- um\n- dois\n1. a\n2. b\n## Detalhe\ntexto');
    expect(html).toContain('<div><b>CAUSAS</b></div><ul><li>um</li><li>dois</li></ul><ol><li>a</li><li>b</li></ol>');
    expect(html).toContain('margin-left:8px');
  });

  it('gera uma linha por cartão sem quebras nem tabulações dentro', () => {
    const tsv = ankiTsv([
      { question: 'Q1', answer: '- a\n- b' },
      { question: 'Q2\tx', answer: 'r' },
    ]);
    const rows = tsv.split('\n');
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.split('\t').length === 2)).toBe(true);
  });
});
