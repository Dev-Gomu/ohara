import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, longDate, monthGrid, shortDate } from './dates';

describe('datas', () => {
  it('soma dias atravessando o mês', () => {
    expect(addDays('2026-11-29', 3)).toBe('2026-12-02');
  });

  it('conta dias entre datas', () => {
    expect(daysBetween('2026-11-07', '2026-11-14')).toBe(7);
  });

  it('escreve em português', () => {
    expect(shortDate('2026-11-07')).toBe('07 nov');
    expect(longDate('2026-11-07')).toBe('sábado, 7 de novembro');
  });

  it('a grade do mês tem semanas completas de domingo a sábado', () => {
    const grid = monthGrid('2026-11-07');
    expect(grid[0]).toBe('2026-11-01');
    expect(grid).toHaveLength(35);
    expect(grid.at(-1)).toBe('2026-12-05');
  });

  it('a grade começa no mês anterior quando preciso', () => {
    expect(monthGrid('2026-12-15')[0]).toBe('2026-11-29');
  });
});
