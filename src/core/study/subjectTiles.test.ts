import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import { activeSubjects, scopePeriods } from './scope';
import { capTiles, subjectTiles, TILE_LIMIT } from './subjectTiles';

const today = '2026-11-07';
const data = createFixtures(today);

describe('grade de disciplinas do treino', () => {
  it('começa por "Todas" e põe os cartões vencidos primeiro', () => {
    const tiles = subjectTiles(data, today, '');
    expect(tiles[0]?.id).toBeNull();
    expect(tiles).toHaveLength(activeSubjects(data).length + 1);
    const dues = tiles.slice(1).map((tile) => tile.due);
    expect(dues).toEqual([...dues].sort((a, b) => b - a));
  });

  it('digitar filtra por sigla ou nome, sem acento nem caixa, e tira "Todas"', () => {
    const tiles = subjectTiles(data, today, 'IMUN');
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.every((tile) => tile.id !== null)).toBe(true);
    expect(tiles.map((tile) => tile.code)).toContain('IMU');
    expect(subjectTiles(data, today, 'zzzz')).toEqual([]);
  });

  it('acima do teto, esconde o resto e conta quantas', () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      id: `m${index}`,
      code: `M${index}`,
      name: `Matéria ${index}`,
      color: 0,
      due: 0,
    }));
    const { shown, hidden } = capTiles(many, null);
    expect(shown).toHaveLength(TILE_LIMIT);
    expect(hidden).toBe(6);
  });

  it('a disciplina escolhida não some quando passa do teto', () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      id: `m${index}`,
      code: `M${index}`,
      name: `Matéria ${index}`,
      color: 0,
      due: 0,
    }));
    const { shown } = capTiles(many, 'm17');
    expect(shown.map((tile) => tile.id)).toContain('m17');
    expect(shown).toHaveLength(TILE_LIMIT);
  });

  it('os períodos de uma matéria são as pastas dela', () => {
    expect(scopePeriods(data, 'imu').map((period) => period.label)).toContain('2º bimestre');
    expect(scopePeriods(data, null).map((period) => period.label)).toContain('1º bimestre');
  });
});
