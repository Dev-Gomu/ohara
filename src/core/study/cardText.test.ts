import { describe, expect, it } from 'vitest';
import {
  appendCard,
  backLines,
  isComplete,
  keepIncomplete,
  parseDrafts,
  parseLine,
  spans,
} from './cardText';

describe('texto do editor de cartões', () => {
  it('reconhece as marcas do começo da linha', () => {
    expect(parseLine('@ O que é IL-6?')).toEqual({ kind: 'front', text: 'O que é IL-6?' });
    expect(parseLine('# Ações')).toEqual({ kind: 'section', text: 'Ações' });
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

  it('Alt N abre um cartão novo no fim', () => {
    expect(appendCard('')).toEqual({ source: '@ ', caret: 2 });
    expect(appendCard('@ IL-6\nFígado\n').source).toBe('@ IL-6\nFígado\n\n@ ');
  });
});
