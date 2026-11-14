import { describe, expect, it } from 'vitest';
import {
  appendCard,
  backBlocks,
  backPreview,
  expandDrafts,
  isComplete,
  backLines,
  keepIncomplete,
  parseDrafts,
  parseLine,
  spans,
} from './cardText';

describe('texto do editor de cartões', () => {
  it('reconhece as marcas do começo da linha', () => {
    expect(parseLine('@ O que é IL-6?')).toEqual({ kind: 'front', text: 'O que é IL-6?' });
    expect(parseLine('# Ações')).toEqual({ kind: 'section', text: 'Ações' });
    expect(parseLine('## Citocinas')).toEqual({ kind: 'subsection', text: 'Citocinas' });
    expect(parseLine('-- Não é específica')).toEqual({ kind: 'con', text: 'Não é específica' });
    expect(parseLine('+ Rápida')).toEqual({ kind: 'pro', text: 'Rápida' });
    expect(parseLine('? Confirmar')).toEqual({ kind: 'doubt', text: 'Confirmar' });
    expect(parseLine('- Febre')).toEqual({ kind: 'item', text: 'Febre' });
    expect(parseLine('2. Fígado')).toEqual({ kind: 'number', text: 'Fígado' });
  });

  it('número e sinal colados não viram lista', () => {
    expect(parseLine('-5 mmHg').kind).toBe('text');
    expect(parseLine('1.5 mg').kind).toBe('text');
    expect(parseLine('+3').kind).toBe('text');
  });

  it('cada @ abre um cartão; as linhas seguintes são o verso', () => {
    const drafts = parseDrafts('@ IL-6\nAge no fígado\n- PCR\n\n@ TNF-α\nFebre');
    expect(drafts).toEqual([
      { front: 'IL-6', back: 'Age no fígado\n- PCR' },
      { front: 'TNF-α', back: 'Febre' },
    ]);
  });

  it('sem @, a primeira linha vira a frente', () => {
    expect(parseDrafts('Quem libera IL-1?\nMacrófago')).toEqual([
      { front: 'Quem libera IL-1?', back: 'Macrófago' },
    ]);
  });

  it('cartão sem verso é incompleto e fica no editor depois de salvar', () => {
    const drafts = parseDrafts('@ IL-6\nFígado\n@ TNF-α');
    expect(drafts.map(isComplete)).toEqual([true, false]);
    expect(keepIncomplete(drafts)).toBe('@ TNF-α');
  });

  it('a numeração recomeça a cada lista', () => {
    const positions = backLines('1. a\n2. b\ntexto\n1. c').map((line) => line.position);
    expect(positions).toEqual([1, 2, 0, 1]);
  });

  it('negrito e destaque dentro da linha', () => {
    expect(spans('A **IL-6** sobe a ==PCR==.')).toEqual([
      { text: 'A ', style: 'plain' },
      { text: 'IL-6', style: 'bold' },
      { text: ' sobe a ', style: 'plain' },
      { text: 'PCR', style: 'mark' },
      { text: '.', style: 'plain' },
    ]);
  });

  it('itálico, sublinhado, sobrescrito, subscrito e setas', () => {
    expect(spans('*a* __b__ H~2~O m^2^ A -> B')).toEqual([
      { text: 'a', style: 'italic' },
      { text: ' ', style: 'plain' },
      { text: 'b', style: 'underline' },
      { text: ' H', style: 'plain' },
      { text: '2', style: 'sub' },
      { text: 'O m', style: 'plain' },
      { text: '2', style: 'sup' },
      { text: ' A → B', style: 'plain' },
    ]);
  });

  it('~ e * soltos continuam texto', () => {
    expect(spans('~5 mg e 2 * 3 * 4')).toEqual([{ text: '~5 mg e 2 * 3 * 4', style: 'plain' }]);
  });

  it('o começo do verso pula os títulos e junta as linhas', () => {
    expect(backPreview('# Efeitos\n- Febre\n## Fígado\nPCR')).toBe('Febre · PCR');
  });

  it('agrupa o verso em seções e subtítulos', () => {
    const blocks = backBlocks('solto\n# Ações\n- a\n## Fígado\n- b\n# Outra\n- c');
    expect(blocks.map((block) => block.title)).toEqual([null, 'Ações', 'Outra']);
    expect(blocks[1]?.lines.map((line) => line.text)).toEqual(['a']);
    expect(blocks[1]?.subs).toEqual([
      { title: 'Fígado', lines: [{ kind: 'item', text: 'b', position: 0 }] },
    ]);
  });

  it('Alt N abre um cartão novo no fim', () => {
    expect(appendCard('')).toEqual({ source: '@ ', caret: 2 });
    expect(appendCard('@ IL-6\nFígado\n').source).toBe('@ IL-6\nFígado\n\n@ ');
  });
});

describe('cloze nos rascunhos', () => {
  it('cloze sem verso é completo e vira um cartão por número', () => {
    const drafts = parseDrafts('@ A {{c1::IL-6}} e {{c2::PCR}}');
    expect(drafts.every(isComplete)).toBe(true);
    expect(expandDrafts(drafts).map((d) => d.front)).toEqual(['A {{c1::IL-6}} e PCR', 'A IL-6 e {{c1::PCR}}']);
    expect(isComplete({ front: 'sem lacuna', back: '' })).toBe(false);
  });
});

describe('frente com continuação', () => {
  it('"@@" soma linhas à frente do cartão', () => {
    expect(parseDrafts('@ Caso: febre\n@@ Qual o agente?\nStreptococcus')).toEqual([
      { front: 'Caso: febre\nQual o agente?', back: 'Streptococcus' },
    ]);
  });
});
