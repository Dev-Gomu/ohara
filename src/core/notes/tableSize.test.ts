import { describe, expect, it } from 'vitest';
import { clampSize, resizeColumn, stepFor } from './tableSize';

describe('tamanho da tabela', () => {
  it('passo pequeno é 8 e grande é 24', () => {
    expect([stepFor(false), stepFor(true)]).toEqual([8, 24]);
  });

  it('nunca passa dos mínimos', () => {
    expect(clampSize('width', 10)).toBe(60);
    expect(clampSize('height', 3)).toBe(28);
    expect(clampSize('width', 100.6)).toBe(101);
  });

  it('muda só a coluna escolhida e arredonda as outras', () => {
    expect(resizeColumn([100.4, 150, 90], 1, 174)).toEqual([100, 174, 90]);
    expect(resizeColumn([100, 150], 0, 20)).toEqual([60, 150]);
  });
});
