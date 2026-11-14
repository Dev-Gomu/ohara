import { describe, expect, it } from 'vitest';
import { replaceSymbols, symbolAtCaret } from './symbols';

describe('símbolos ao digitar', () => {
  it('troca os pares da tabela', () => {
    expect(replaceSymbols('IL-6 -> PCR')).toBe('IL-6 → PCR');
    expect(replaceSymbols('a <= b >= c != d +- e')).toBe('a ≤ b ≥ c ≠ d ± e');
    expect(replaceSymbols('A <-> B => C <- D')).toBe('A ↔ B ⇒ C ← D');
  });

  it('não mexe em texto comum', () => {
    expect(replaceSymbols('-5 mmHg, 1.5 mg, A - B')).toBe('-5 mmHg, 1.5 mg, A - B');
  });

  it('ao digitar, troca só quando o símbolo fecha e acerta o cursor', () => {
    expect(symbolAtCaret('IL-6 ->', 7)).toEqual({ text: 'IL-6 →', caret: 6 });
    expect(symbolAtCaret('a <= b', 4)).toEqual({ text: 'a ≤ b', caret: 3 });
    expect(symbolAtCaret('IL-6 -', 6)).toBeNull();
  });

  it('"<->" vira seta dupla, não "<" mais seta', () => {
    expect(symbolAtCaret('A <->', 5)).toEqual({ text: 'A ↔', caret: 3 });
  });
});
