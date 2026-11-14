import { describe, expect, it } from 'vitest';
import { clozeNumbers, clozeParts, expandCloze, hasCloze } from './cloze';

const TEXT = 'A {{c1::IL-6}} induz {{c2::PCR}} no fígado, e {{c1::TNF}} também.';

describe('cloze', () => {
  it('reconhece a escrita do Anki e os números', () => {
    expect(hasCloze(TEXT)).toBe(true);
    expect(hasCloze('texto {c1:x} sem lacuna')).toBe(false);
    expect(clozeNumbers(TEXT)).toEqual([1, 2]);
  });

  it('esconde com […] ou revela, sem a dica', () => {
    expect(clozeParts('A {{c1::IL-6::citocina}} age', false).map((p) => p.text).join('')).toBe('A […] age');
    expect(clozeParts('A {{c1::IL-6::citocina}} age', true)[1]).toEqual({ text: 'IL-6', kind: 'answer' });
  });

  it('gera um cartão por número, só com a lacuna da vez', () => {
    expect(expandCloze(TEXT)).toEqual([
      'A {{c1::IL-6}} induz PCR no fígado, e {{c1::TNF}} também.',
      'A IL-6 induz {{c1::PCR}} no fígado, e TNF também.',
    ]);
    expect(expandCloze('sem lacuna')).toEqual([]);
  });
});
